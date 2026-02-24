import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { ActionType, Role, type UserResponse, type UserWithRelations, type EmbeddedRelation, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import { generateDefaultPassword } from '../lib/password'
import { getUserFullName } from '../utils/audit.utils'
import { logUserAction } from '../utils/user-log.utils'
import type { User as PrismaUser, Prisma } from '@prisma/client'

const SALT_ROUNDS = 10

type PrismaUserWithOptionalRelations = PrismaUser & {
  department?: EmbeddedRelation
  section?: EmbeddedRelation | null
}

interface UpdateUserPayload {
  password?: string
  firstName?: string
  lastName?: string
  departmentId?: number
  sectionId?: number | null
  email?: string | null
  tel?: string | null
  role?: Role
  status?: 'active' | 'inactive'
  updatedAt: Date
  updatedBy: string
  updatedByName: string
  tokenVersion?: { increment: number }
}

export interface UserFilters {
  search?: string
  departmentId?: number
  sectionId?: number
  role?: Role
  status?: 'active' | 'inactive'
}

export class UserService {
  private static formatUserResponse(user: PrismaUser): UserResponse {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      departmentId: user.departmentId,
      sectionId: user.sectionId,
      email: user.email,
      tel: user.tel,
      role: user.role as Role,
      status: user.status as Status,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      createdByName: user.createdByName,
      updatedAt: user.updatedAt,
      updatedBy: user.updatedBy,
      updatedByName: user.updatedByName,
      lastLoginAt: user.lastLoginAt
    }
  }

  private static buildWhereClause(filters?: UserFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {}
    if (filters?.search) {
      where.OR = [
        { username: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    if (filters?.departmentId !== undefined) {
      where.departmentId = filters.departmentId
    }
    if (filters?.sectionId !== undefined) {
      where.sectionId = filters.sectionId
    }
    if (filters?.role !== undefined) {
      where.role = filters.role
    }
    if (filters?.status !== undefined) {
      where.status = filters.status
    }
    return where
  }

  static async getAll(
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginationResult<UserWithRelations>> {
    const where = this.buildWhereClause(filters)
    const paginationOptions = calculatePagination(pagination)

    // Handle relation-based sorting for department and section
    const relationSortFields: Record<string, string> = {
      department: 'department',
      section: 'section',
    }

    if (pagination.sort && relationSortFields[pagination.sort]) {
      paginationOptions.orderBy = {
        [relationSortFields[pagination.sort]]: { name: pagination.order || 'asc' },
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } }
        },
        ...paginationOptions
      }),
      prisma.user.count({ where })
    ])

    const formattedUsers = (users as PrismaUserWithOptionalRelations[]).map((user) => ({
      ...this.formatUserResponse(user),
      department: user.department,
      section: user.section
    })) as UserWithRelations[]

    return formatPaginationResponse(formattedUsers, total, pagination)
  }

  static async getAllSimple(filters?: UserFilters): Promise<UserWithRelations[]> {
    const where = this.buildWhereClause(filters)

    const users = await prisma.user.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return (users as PrismaUserWithOptionalRelations[]).map((user) => ({
      ...this.formatUserResponse(user),
      department: user.department,
      section: user.section
    })) as UserWithRelations[]
  }

  static async create(
    username: string,
    firstName: string,
    lastName: string,
    departmentId: number,
    sectionId: number | null,
    email: string | null,
    tel: string | null,
    role: Role,
    createdBy: string
  ): Promise<{ user: UserResponse; password: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      throw new ConflictError(CODES.USER_USERNAME_EXISTS, MSG.errors.user.usernameExists)
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound)
    }

    if (sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId }
      })

      if (!section) {
        throw new NotFoundError(CODES.SECTION_NOT_FOUND, MSG.errors.section.notFound)
      }
    }

    const password = generateDefaultPassword()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const createdByName = await getUserFullName(createdBy)

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          username,
          password: hashedPassword,
          firstName,
          lastName,
          departmentId,
          sectionId,
          email,
          tel,
          role,
          createdBy,
          createdByName,
          updatedAt: null,
          updatedBy: null
        },
        include: {
          department: { select: { name: true } },
          section: { select: { name: true } }
        }
      })

      await logUserAction(created, ActionType.CREATE, tx)
      return created
    })

    return {
      user: this.formatUserResponse(user),
      password
    }
  }

  static async getById(id: number, includeRelations = false): Promise<UserResponse | UserWithRelations> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: includeRelations
        ? {
          department: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } }
        }
        : undefined
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    const base = this.formatUserResponse(user)
    if (includeRelations) {
      const userWithRelations = user as PrismaUserWithOptionalRelations
      return {
        ...base,
        department: userWithRelations.department,
        section: userWithRelations.section
      } as UserWithRelations
    }
    return base
  }

  static async update(
    id: number,
    data: {
      password?: string
      firstName?: string
      lastName?: string
      departmentId?: number
      sectionId?: number | null
      email?: string | null
      tel?: string | null
      role?: Role
      status?: 'active' | 'inactive'
    },
    updatedBy: string
  ): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      })

      if (!department) {
        throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound)
      }
    }

    if (data.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: data.sectionId }
      })

      if (!section) {
        throw new NotFoundError(CODES.SECTION_NOT_FOUND, MSG.errors.section.notFound)
      }
    }

    const updatedByName = await getUserFullName(updatedBy)

    const updateData: UpdateUserPayload = {
      ...data,
      updatedAt: new Date(),
      updatedBy,
      updatedByName
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS)
    }

    // Invalidate active sessions when user is disabled
    if (data.status === 'inactive' && existingUser.status !== 'inactive') {
      updateData.tokenVersion = { increment: 1 }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: updateData as Prisma.UserUpdateInput,
        include: {
          department: { select: { name: true } },
          section: { select: { name: true } }
        }
      })

      await logUserAction(updated, ActionType.UPDATE, tx)
      return updated
    })

    return this.formatUserResponse(updatedUser)
  }

  static async delete(id: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: { select: { name: true } },
        section: { select: { name: true } }
      }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    await prisma.$transaction(async (tx) => {
      await logUserAction(user, ActionType.DELETE, tx)
      // Invalidate active sessions before deleting
      await tx.user.update({
        where: { id },
        data: { tokenVersion: { increment: 1 } }
      })
      await tx.user.delete({ where: { id } })
    })
  }

  static async verifyPassword(id: number, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    return await bcrypt.compare(password, user.password)
  }

  static async resetPassword(id: number, updatedBy: string): Promise<{ user: UserResponse; password: string }> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    const password = generateDefaultPassword()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const updatedByName = await getUserFullName(updatedBy)

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          isDefaultPassword: true,
          tokenVersion: { increment: 1 },
          updatedAt: new Date(),
          updatedBy,
          updatedByName
        },
        include: {
          department: { select: { name: true } },
          section: { select: { name: true } }
        }
      })

      await logUserAction(updated, ActionType.RESET_PASSWORD, tx)
      return updated
    })

    return {
      user: this.formatUserResponse(updatedUser),
      password
    }
  }

  static async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new ValidationError(CODES.USER_INVALID_PASSWORD, MSG.errors.user.invalidPassword)
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    const updatedByName = `${user.firstName} ${user.lastName}`

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          isDefaultPassword: false,
          updatedAt: new Date(),
          updatedBy: user.username,
          updatedByName
        },
        include: {
          department: { select: { name: true } },
          section: { select: { name: true } }
        }
      })

      await logUserAction(updated, ActionType.CHANGE_PASSWORD, tx)
      return updated
    })

    return this.formatUserResponse(updatedUser)
  }
}

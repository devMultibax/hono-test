import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { ActionType, Role, type UserResponse, type UserWithRelations, type EmbeddedRelation, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import { generateDefaultPassword } from '../lib/password'
import { getUserFullName } from '../utils/audit.utils'
import type { User as PrismaUser, Prisma, ActionType as PrismaActionType } from '@prisma/client'

const SALT_ROUNDS = 10

type UserForLog = {
  username: string
  firstName: string
  lastName: string
  email: string | null
  tel: string | null
  role: string
  status: string
  createdAt: Date
  createdBy: string
  createdByName: string
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
  department: { name: string }
  section: { name: string } | null
}

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

  static async getAll(
    includeRelations = false,
    pagination?: PaginationParams,
    filters?: UserFilters
  ): Promise<UserResponse[] | UserWithRelations[] | PaginationResult<UserResponse> | PaginationResult<UserWithRelations>> {
    const where: Prisma.UserWhereInput = {}

    if (filters) {
      if (filters.search) {
        where.OR = [
          { username: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } }
        ]
      }

      if (filters.departmentId !== undefined) {
        where.departmentId = filters.departmentId
      }

      if (filters.sectionId !== undefined) {
        where.sectionId = filters.sectionId
      }

      if (filters.role !== undefined) {
        where.role = filters.role
      }

      if (filters.status !== undefined) {
        where.status = filters.status
      }
    }

    const includeConfig = includeRelations
      ? {
        department: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } }
      }
      : undefined

    if (pagination) {
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
          include: includeConfig,
          ...paginationOptions
        }),
        prisma.user.count({ where })
      ])

      const formattedUsers = (users as PrismaUserWithOptionalRelations[]).map((user) => {
        const base = this.formatUserResponse(user)
        if (includeRelations) {
          return {
            ...base,
            department: user.department,
            section: user.section
          } as UserWithRelations
        }
        return base
      })

      return formatPaginationResponse(formattedUsers, total, pagination)
    }

    const users = await prisma.user.findMany({
      where,
      include: includeConfig,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return (users as PrismaUserWithOptionalRelations[]).map((user) => {
      const base = this.formatUserResponse(user)
      if (includeRelations) {
        return {
          ...base,
          department: user.department,
          section: user.section
        } as UserWithRelations
      }
      return base
    })
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
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      throw new ConflictError(CODES.USER_USERNAME_EXISTS, MSG.errors.user.usernameExists)
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound)
    }

    // Verify section exists if provided
    if (sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId }
      })

      if (!section) {
        throw new NotFoundError(CODES.SECTION_NOT_FOUND, MSG.errors.section.notFound)
      }
    }

    // Generate default password
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
          department: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } }
        }
      })

      await this.logUserAction(created, ActionType.CREATE, tx)
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
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } }
      }
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
          department: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } }
        }
      })

      await this.logUserAction(updated, ActionType.UPDATE, tx)
      return updated
    })

    return this.formatUserResponse(updatedUser)
  }

  static async delete(id: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } }
      }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    await prisma.$transaction(async (tx) => {
      await this.logUserAction(user, ActionType.DELETE, tx)
      // Invalidate active sessions before deleting
      await tx.user.update({
        where: { id },
        data: { tokenVersion: { increment: 1 } }
      })
      await tx.user.delete({ where: { id } })
    })
  }

  // Password Management Methods
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

    // Generate new default password
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
          department: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } }
        }
      })

      await this.logUserAction(updated, ActionType.RESET_PASSWORD, tx)
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
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } }
      }
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
          department: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } }
        }
      })

      await this.logUserAction(updated, ActionType.CHANGE_PASSWORD, tx)
      return updated
    })

    return this.formatUserResponse(updatedUser)
  }

  private static async logUserAction(
    user: UserForLog,
    actionType: ActionType,
    tx?: Pick<typeof prisma, 'userLog'>
  ): Promise<void> {
    const data = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department.name,
      section: user.section?.name || '',
      email: user.email,
      tel: user.tel,
      role: user.role as Role,
      status: user.status as 'active' | 'inactive',
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      createdByName: user.createdByName || '',
      updatedAt: user.updatedAt,
      updatedBy: user.updatedBy,
      updatedByName: user.updatedByName,
      actionType: actionType as unknown as PrismaActionType
    }

    if (tx) {
      await tx.userLog.create({ data })
    } else {
      await prisma.userLog.create({ data })
    }
  }
}


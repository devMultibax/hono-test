import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { ActionType, Role, type UserResponse, type UserWithRelations, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import { generateDefaultPassword } from '../lib/password'
import { getUserFullName } from '../utils/audit.utils'
import type { Prisma } from '@prisma/client'

const SALT_ROUNDS = 10

export interface UserFilters {
  search?: string
  departmentId?: number
  sectionId?: number
  role?: Role
  status?: 'active' | 'inactive'
}

export class UserService {
  private static formatUserResponse(user: any): UserResponse {
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
        department: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            createdBy: true,
            createdByName: true,
            updatedAt: true,
            updatedBy: true,
            updatedByName: true
          }
        },
        section: {
          select: {
            id: true,
            departmentId: true,
            name: true,
            status: true,
            createdAt: true,
            createdBy: true,
            createdByName: true,
            updatedAt: true,
            updatedBy: true,
            updatedByName: true
          }
        }
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

      const formattedUsers = users.map((user: any) => {
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

    return users.map((user: any) => {
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
      throw new Error('Username already exists')
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      throw new NotFoundError('Department not found')
    }

    // Verify section exists if provided
    if (sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId }
      })

      if (!section) {
        throw new NotFoundError('Section not found')
      }
    }

    // Generate default password
    const password = generateDefaultPassword()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const createdByName = await getUserFullName(createdBy)

    // Create user
    const user = await prisma.user.create({
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
        department: true,
        section: true
      }
    })

    await this.logUserAction(user, ActionType.CREATE)

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
          department: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
              createdBy: true,
              createdByName: true,
              updatedAt: true,
              updatedBy: true,
              updatedByName: true
            }
          },
          section: {
            select: {
              id: true,
              departmentId: true,
              name: true,
              status: true,
              createdAt: true,
              createdBy: true,
              createdByName: true,
              updatedAt: true,
              updatedBy: true,
              updatedByName: true
            }
          }
        }
        : undefined
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const base = this.formatUserResponse(user)
    if (includeRelations) {
      return {
        ...base,
        department: (user as any).department,
        section: (user as any).section
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
        department: true,
        section: true
      }
    })

    if (!existingUser) {
      throw new NotFoundError('User not found')
    }

    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      })

      if (!department) {
        throw new NotFoundError('Department not found')
      }
    }

    if (data.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: data.sectionId }
      })

      if (!section) {
        throw new NotFoundError('Section not found')
      }
    }

    const updatedByName = await getUserFullName(updatedBy)

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
      updatedBy,
      updatedByName
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        section: true
      }
    })

    await this.logUserAction(updatedUser, ActionType.UPDATE)

    return this.formatUserResponse(updatedUser)
  }

  static async delete(id: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        section: true
      }
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    await this.logUserAction(user as any, ActionType.DELETE)

    try {
      await prisma.user.delete({
        where: { id }
      })
    } catch {
      throw new NotFoundError('User not found')
    }
  }

  // Password Management Methods
  static async verifyPassword(id: number, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return await bcrypt.compare(password, user.password)
  }

  static async resetPassword(id: number, updatedBy: string): Promise<{ user: UserResponse; password: string }> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Generate new default password
    const password = generateDefaultPassword()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
    const updatedByName = await getUserFullName(updatedBy)

    const updatedUser = await prisma.user.update({
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
        department: true,
        section: true
      }
    })

    await this.logUserAction(updatedUser as any, ActionType.UPDATE)

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
        department: true,
        section: true
      }
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    const updatedByName = `${user.firstName} ${user.lastName}`

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        isDefaultPassword: false,
        updatedAt: new Date(),
        updatedBy: user.username,
        updatedByName
      },
      include: {
        department: true,
        section: true
      }
    })

    await this.logUserAction(updatedUser as any, ActionType.UPDATE)

    return this.formatUserResponse(updatedUser)
  }

  private static async logUserAction(user: any, actionType: ActionType): Promise<void> {
    await prisma.userLog.create({
      data: {
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
        actionType
      }
    })
  }
}


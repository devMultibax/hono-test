import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { ActionType, Role, type UserResponse, type UserWithRelations, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
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
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
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
            updatedAt: true
          }
        },
        section: {
          select: {
            id: true,
            departmentId: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
      : undefined

    if (pagination) {
      const paginationOptions = calculatePagination(pagination)

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
    password: string,
    firstName: string,
    lastName: string,
    departmentId: number,
    sectionId: number | null,
    email: string | null,
    tel: string | null,
    role: Role,
    createdBy: string
  ): Promise<UserResponse> {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

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
        createdBy
      },
      include: {
        department: true,
        section: true
      }
    })

    await this.logUserAction(user, ActionType.CREATE)

    return this.formatUserResponse(user)
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
              updatedAt: true
            }
          },
          section: {
            select: {
              id: true,
              departmentId: true,
              name: true,
              status: true,
              createdAt: true,
              updatedAt: true
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

    const updateData: any = {
      ...data,
      updatedBy
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
        updatedAt: user.updatedAt,
        updatedBy: user.updatedBy,
        actionType
      }
    })
  }
}


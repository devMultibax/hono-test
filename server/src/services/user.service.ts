import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { ActionType, Role, type UserResponse, type UserWithRelations, Status } from '../types'

const SALT_ROUNDS = 10

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

  static async getAll(includeRelations = false): Promise<UserResponse[] | UserWithRelations[]> {
    const users = await prisma.user.findMany({
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
        : undefined,
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


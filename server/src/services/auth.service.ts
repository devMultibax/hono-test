import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { UnauthorizedError, NotFoundError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { ActionType, Role, Status, type AuthPayload, type LoginResponse, type UserWithRelations } from '../types'

const TOKEN_EXPIRY = '24h'

export class AuthService {
  private static formatUserResponse(user: {
    id: number
    username: string
    firstName: string
    lastName: string
    departmentId: number
    sectionId: number | null
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
    lastLoginAt: Date | null
    department?: {
      id: number
      name: string
      status: string
      createdAt: Date
      createdBy: string
      createdByName: string
      updatedAt: Date | null
      updatedBy: string | null
      updatedByName: string | null
    }
    section?: {
      id: number
      departmentId: number
      name: string
      status: string
      createdAt: Date
      createdBy: string
      createdByName: string
      updatedAt: Date | null
      updatedBy: string | null
      updatedByName: string | null
    } | null
  }): UserWithRelations {
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
      lastLoginAt: user.lastLoginAt,
      department: user.department ? {
        id: user.department.id,
        name: user.department.name,
        status: user.department.status as Status,
        createdAt: user.department.createdAt,
        createdBy: user.department.createdBy,
        createdByName: user.department.createdByName,
        updatedAt: user.department.updatedAt,
        updatedBy: user.department.updatedBy,
        updatedByName: user.department.updatedByName
      } : undefined,
      section: user.section ? {
        id: user.section.id,
        departmentId: user.section.departmentId,
        name: user.section.name,
        status: user.section.status as Status,
        createdAt: user.section.createdAt,
        createdBy: user.section.createdBy,
        createdByName: user.section.createdByName,
        updatedAt: user.section.updatedAt,
        updatedBy: user.section.updatedBy,
        updatedByName: user.section.updatedByName
      } : null
    }
  }

  static async login(username: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        department: true,
        section: true
      }
    })

    if (!user) {
      throw new UnauthorizedError(CODES.AUTH_INVALID_CREDENTIALS)
    }

    if (user.status === 'inactive') {
      throw new UnauthorizedError(CODES.AUTH_ACCOUNT_INACTIVE)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedError(CODES.AUTH_INVALID_CREDENTIALS)
    }

    // Detect active session before incrementing tokenVersion
    const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000
    const previousSessionTerminated =
      !!user.lastLoginAt &&
      Date.now() - user.lastLoginAt.getTime() < TOKEN_EXPIRY_MS

    // Increment tokenVersion to invalidate previous sessions + update lastLoginAt
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        tokenVersion: { increment: 1 }
      }
    })

    const payload: AuthPayload = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as Role,
      tokenVersion: updatedUser.tokenVersion
    }

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY
    })

    return {
      token,
      user: this.formatUserResponse({
        ...user,
        lastLoginAt: new Date(),
        department: user.department,
        section: user.section
      }),
      previousSessionTerminated
    }
  }

  static async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload

      if (decoded.tokenVersion !== undefined) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { tokenVersion: true, status: true }
        })

        if (!user) {
          throw new UnauthorizedError(CODES.AUTH_ACCOUNT_DELETED)
        }

        // Check if user account is still active (before tokenVersion check)
        if (user.status === 'inactive') {
          throw new UnauthorizedError(CODES.AUTH_ACCOUNT_INACTIVE)
        }

        if (user.tokenVersion !== decoded.tokenVersion) {
          throw new UnauthorizedError(CODES.AUTH_SESSION_REPLACED)
        }
      }

      return decoded
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError(CODES.AUTH_INVALID_TOKEN)
    }
  }

  static async logout(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } }
    })
  }

  // Profile Management Methods
  static async getCurrentUser(userId: number): Promise<UserWithRelations> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        section: true
      }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND)
    }

    return this.formatUserResponse(user)
  }

  static async updateProfile(
    userId: number,
    data: {
      firstName?: string
      lastName?: string
      email?: string | null
      tel?: string | null
    }
  ): Promise<UserWithRelations> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedBy: user.username,
        updatedByName: `${user.firstName} ${user.lastName}`
      },
      include: {
        department: true,
        section: true
      }
    })

    await this.logUserAction(updatedUser, ActionType.UPDATE)

    return this.formatUserResponse(updatedUser)
  }

  private static async logUserAction(
    user: {
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
    },
    actionType: ActionType
  ): Promise<void> {
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
        status: user.status as Status,
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

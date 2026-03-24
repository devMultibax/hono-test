import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { UnauthorizedError, NotFoundError, ConflictError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { ActionType, Role, Status, type AuthPayload, type LoginResponse, type UserWithRelations, type UserDepartmentEntry } from '../types'
import { daysToMs } from '../utils/time.utils'
import { logUserAction } from '../utils/user-log.utils'

const TOKEN_EXPIRY = '24h'

const DEPARTMENTS_INCLUDE = {
  departments: {
    include: {
      department: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } }
    },
    orderBy: [
      { isPrimary: 'desc' as const },
      { department: { name: 'asc' as const } }
    ]
  }
}

function formatDepartments(
  depts?: Array<{
    departmentId: number
    sectionId: number | null
    isPrimary: boolean
    department: { id: number; name: string }
    section: { id: number; name: string } | null
  }>
): UserDepartmentEntry[] {
  return (depts ?? []).map((ud) => ({
    departmentId: ud.departmentId,
    sectionId: ud.sectionId,
    isPrimary: ud.isPrimary,
    department: { id: ud.department.id, name: ud.department.name },
    section: ud.section ? { id: ud.section.id, name: ud.section.name } : null
  }))
}

type UserWithDepartments = {
  id: number
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
  lastLoginAt: Date | null
  isDefaultPassword: boolean
  tokenVersion?: number
  departments: Array<{
    departmentId: number
    sectionId: number | null
    isPrimary: boolean
    department: { id: number; name: string }
    section: { id: number; name: string } | null
  }>
}

export class AuthService {
  private static formatUserResponse(user: UserWithDepartments): UserWithRelations {
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
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
      isDefaultPassword: user.isDefaultPassword,
      departments: formatDepartments(user.departments)
    }
  }

  static async login(username: string, password: string): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: DEPARTMENTS_INCLUDE
    })

    if (!user) {
      throw new UnauthorizedError(CODES.AUTH_INVALID_CREDENTIALS, MSG.errors.auth.invalidCredentials)
    }

    if (user.status === 'inactive') {
      throw new UnauthorizedError(CODES.AUTH_ACCOUNT_INACTIVE, MSG.errors.auth.accountInactive)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedError(CODES.AUTH_INVALID_CREDENTIALS, MSG.errors.auth.invalidCredentials)
    }

    // Detect active session before incrementing tokenVersion
    const TOKEN_EXPIRY_MS = daysToMs(1)
    const previousSessionTerminated = !!user.lastLoginAt && Date.now() - user.lastLoginAt.getTime() < TOKEN_EXPIRY_MS

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
        tokenVersion: updatedUser.tokenVersion
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
          throw new UnauthorizedError(CODES.AUTH_ACCOUNT_DELETED, MSG.errors.auth.accountDeleted)
        }

        // Check if user account is still active (before tokenVersion check)
        if (user.status === 'inactive') {
          throw new UnauthorizedError(CODES.AUTH_ACCOUNT_INACTIVE, MSG.errors.auth.accountInactive)
        }

        if (user.tokenVersion !== decoded.tokenVersion) {
          throw new UnauthorizedError(CODES.AUTH_SESSION_REPLACED, MSG.errors.auth.sessionReplaced)
        }
      }

      return decoded
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError(CODES.AUTH_INVALID_TOKEN, MSG.errors.auth.invalidToken)
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
      include: DEPARTMENTS_INCLUDE
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
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
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    if (data.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email: { equals: data.email, mode: 'insensitive' }, NOT: { id: userId } }
      })
      if (emailTaken) {
        throw new ConflictError(CODES.USER_EMAIL_EXISTS, MSG.errors.user.emailExists)
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedBy: user.username,
        updatedByName: `${user.firstName} ${user.lastName}`
      },
      include: DEPARTMENTS_INCLUDE
    })

    await logUserAction(updatedUser, ActionType.UPDATE)

    return this.formatUserResponse(updatedUser)
  }

}

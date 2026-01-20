import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors'
import { ActionType, Role, Status, type AuthPayload, type LoginResponse, type RegisterResponse, type UserResponse } from '../types'

const SALT_ROUNDS = 10
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
    lastLoginAt: Date | null
  }): UserResponse {
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

  static async register(data: {
    username: string
    password: string
    firstName: string
    lastName: string
    departmentId: number
    sectionId?: number | null
    email?: string | null
    tel?: string | null
    role?: Role
  }): Promise<RegisterResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    })

    if (existingUser) {
      throw new ConflictError('Username already exists')
    }

    const department = await prisma.department.findUnique({
      where: { id: data.departmentId }
    })

    if (!department) {
      throw new NotFoundError('Department not found')
    }

    if (data.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: data.sectionId }
      })

      if (!section) {
        throw new NotFoundError('Section not found')
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        departmentId: data.departmentId,
        sectionId: data.sectionId || null,
        email: data.email || null,
        tel: data.tel || null,
        role: data.role || Role.USER,
        createdBy: data.username
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        sectionId: true,
        email: true,
        tel: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        department: true,
        section: true
      }
    })

    if (userWithRelations) {
      await this.logUserAction(userWithRelations, ActionType.CREATE)
    }

    return {
      user: this.formatUserResponse(user)
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
      throw new UnauthorizedError('Invalid credentials')
    }

    if (user.status === 'inactive') {
      throw new UnauthorizedError('Account is inactive')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    const payload: AuthPayload = {
      id: user.id,
      username: user.username,
      role: user.role as Role,
      tokenVersion: user.tokenVersion
    }

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY
    })

    await this.logUserAction(user, ActionType.LOGIN)

    return {
      token,
      user: this.formatUserResponse({ ...user, lastLoginAt: new Date() })
    }
  }

  static async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload

      if (decoded.tokenVersion !== undefined) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { tokenVersion: true }
        })

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
          throw new UnauthorizedError('Invalid token')
        }
      }

      return decoded
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError('Invalid token')
    }
  }

  static async logout(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        section: true
      }
    })

    if (user) {
      await this.logUserAction(user, ActionType.LOGOUT)
    }
  }

  // Profile Management Methods
  static async getCurrentUser(userId: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        sectionId: true,
        email: true,
        tel: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    if (!user) {
      throw new NotFoundError('User not found')
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
  ): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedBy: user.username
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        departmentId: true,
        sectionId: true,
        email: true,
        tel: true,
        role: true,
        status: true,
        createdAt: true,
        lastLoginAt: true
      }
    })

    const userWithRelations = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        section: true
      }
    })

    if (userWithRelations) {
      await this.logUserAction(userWithRelations, ActionType.UPDATE)
    }

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
      updatedAt: Date | null
      updatedBy: string | null
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
        updatedAt: user.updatedAt,
        updatedBy: user.updatedBy,
        actionType
      }
    })
  }
}

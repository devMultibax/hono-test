import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { ActionType, Role, type UserResponse, type UserWithRelations, type UserDepartmentEntry, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import { generateDefaultPassword } from '../lib/password'
import { getUserFullName } from '../utils/audit.utils'
import { logUserAction } from '../utils/user-log.utils'
import type { Prisma } from '@prisma/client'

const SALT_ROUNDS = 10

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

interface DepartmentInput {
  departmentId: number
  sectionId?: number | null
  isPrimary: boolean
}

interface UpdateUserPayload {
  password?: string
  firstName?: string
  lastName?: string
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
  departmentIds?: number[]
  sectionId?: number
  role?: Role
  status?: 'active' | 'inactive'
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

export class UserService {
  private static formatUserResponse(user: {
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
  }): UserResponse {
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
      isDefaultPassword: user.isDefaultPassword
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
      where.departments = { some: { departmentId: filters.departmentId } }
    } else if (filters?.departmentIds !== undefined) {
      where.departments = filters.departmentIds.length
        ? { some: { departmentId: { in: filters.departmentIds } } }
        : { some: { departmentId: { in: [] } } }
    }
    if (filters?.sectionId !== undefined) {
      where.departments = {
        ...where.departments as object,
        some: {
          ...((where.departments as { some?: object })?.some ?? {}),
          sectionId: filters.sectionId
        }
      }
    }
    if (filters?.role !== undefined) {
      where.role = filters.role
    }
    if (filters?.status !== undefined) {
      where.status = filters.status
    }
    return where
  }

  static async validateDepartments(departments: DepartmentInput[]): Promise<void> {
    const deptIds = departments.map((d) => d.departmentId)
    const activeDepts = await prisma.department.findMany({
      where: { id: { in: deptIds }, status: 'active' },
      select: { id: true }
    })
    const activeDeptSet = new Set(activeDepts.map((d) => d.id))

    for (const entry of departments) {
      if (!activeDeptSet.has(entry.departmentId)) {
        throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound)
      }

      if (entry.sectionId) {
        const section = await prisma.section.findUnique({
          where: { id: entry.sectionId },
          select: { id: true, departmentId: true, status: true }
        })
        if (!section) {
          throw new NotFoundError(CODES.SECTION_NOT_FOUND, MSG.errors.section.notFound)
        }
        if (section.departmentId !== entry.departmentId) {
          throw new ValidationError(CODES.USER_SECTION_DEPT_MISMATCH, MSG.errors.user.sectionDeptMismatch)
        }
        if (section.status !== 'active') {
          throw new NotFoundError(CODES.SECTION_NOT_FOUND, MSG.errors.section.notFound)
        }
      }
    }
  }

  static async getAll(
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginationResult<UserWithRelations>> {
    const where = this.buildWhereClause(filters)
    const paginationOptions = calculatePagination(pagination)

    // For department/section sort, we sort in-memory by primary department name
    const needsManualSort = pagination.sort === 'department' || pagination.sort === 'section'
    if (needsManualSort) {
      delete paginationOptions.orderBy
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: DEPARTMENTS_INCLUDE,
        ...paginationOptions
      }),
      prisma.user.count({ where })
    ])

    let formattedUsers = users.map((user) => ({
      ...this.formatUserResponse(user),
      departments: formatDepartments(user.departments)
    })) as UserWithRelations[]

    if (needsManualSort) {
      const order = pagination.order || 'asc'
      formattedUsers.sort((a, b) => {
        const primaryA = a.departments.find((d) => d.isPrimary)
        const primaryB = b.departments.find((d) => d.isPrimary)
        let valA = ''
        let valB = ''
        if (pagination.sort === 'department') {
          valA = primaryA?.department?.name ?? ''
          valB = primaryB?.department?.name ?? ''
        } else {
          valA = primaryA?.section?.name ?? ''
          valB = primaryB?.section?.name ?? ''
        }
        const cmp = valA.localeCompare(valB)
        return order === 'asc' ? cmp : -cmp
      })
    }

    return formatPaginationResponse(formattedUsers, total, pagination)
  }

  static async getAllSimple(filters?: UserFilters): Promise<UserWithRelations[]> {
    const where = this.buildWhereClause(filters)

    const users = await prisma.user.findMany({
      where,
      include: DEPARTMENTS_INCLUDE,
      orderBy: { createdAt: 'desc' }
    })

    return users.map((user) => ({
      ...this.formatUserResponse(user),
      departments: formatDepartments(user.departments)
    })) as UserWithRelations[]
  }

  static async create(
    username: string,
    firstName: string,
    lastName: string,
    departments: DepartmentInput[],
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

    if (email) {
      const emailTaken = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
      if (emailTaken) {
        throw new ConflictError(CODES.USER_EMAIL_EXISTS, MSG.errors.user.emailExists)
      }
    }

    await this.validateDepartments(departments)

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
          email,
          tel,
          role,
          isDefaultPassword: true,
          createdBy,
          createdByName,
          updatedAt: null,
          updatedBy: null,
          departments: {
            create: departments.map((d) => ({
              departmentId: d.departmentId,
              sectionId: d.sectionId ?? null,
              isPrimary: d.isPrimary,
            }))
          }
        },
        include: DEPARTMENTS_INCLUDE
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
      include: includeRelations ? DEPARTMENTS_INCLUDE : undefined
    })

    if (!user) {
      throw new NotFoundError(CODES.USER_NOT_FOUND, MSG.errors.user.notFound)
    }

    const base = this.formatUserResponse(user)
    if (includeRelations) {
      return {
        ...base,
        departments: formatDepartments((user as typeof user & { departments: Array<{ departmentId: number; sectionId: number | null; isPrimary: boolean; department: { id: number; name: string }; section: { id: number; name: string } | null }> }).departments)
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
      departments?: DepartmentInput[]
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

    if (data.email) {
      const emailTaken = await prisma.user.findFirst({
        where: { email: { equals: data.email, mode: 'insensitive' }, NOT: { id } }
      })
      if (emailTaken) {
        throw new ConflictError(CODES.USER_EMAIL_EXISTS, MSG.errors.user.emailExists)
      }
    }

    if (data.departments) {
      await this.validateDepartments(data.departments)
    }

    const updatedByName = await getUserFullName(updatedBy)

    const { departments: deptData, ...restData } = data
    const updateData: UpdateUserPayload = {
      ...restData,
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
      if (deptData) {
        await tx.userDepartment.deleteMany({ where: { userId: id } })
        await tx.userDepartment.createMany({
          data: deptData.map((d) => ({
            userId: id,
            departmentId: d.departmentId,
            sectionId: d.sectionId ?? null,
            isPrimary: d.isPrimary,
          }))
        })
      }

      const updated = await tx.user.update({
        where: { id },
        data: updateData as Prisma.UserUpdateInput,
        include: DEPARTMENTS_INCLUDE
      })

      await logUserAction(updated, ActionType.UPDATE, tx)
      return updated
    })

    return this.formatUserResponse(updatedUser)
  }

  static async delete(id: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: DEPARTMENTS_INCLUDE
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
        include: DEPARTMENTS_INCLUDE
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
        include: DEPARTMENTS_INCLUDE
      })

      await logUserAction(updated, ActionType.CHANGE_PASSWORD, tx)
      return updated
    })

    return this.formatUserResponse(updatedUser)
  }
}

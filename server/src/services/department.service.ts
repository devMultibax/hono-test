import { prisma } from '../lib/prisma'
import { NotFoundError, ConflictError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import type { DepartmentResponse, DepartmentWithRelations, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import { getUserFullName } from '../utils/audit.utils'
import type { Prisma } from '@prisma/client'

export interface DepartmentFilters {
  search?: string
  status?: 'active' | 'inactive'
}

export class DepartmentService {
  private static formatDepartmentResponse(department: {
    id: number
    name: string
    status: string
    createdAt: Date
    createdBy: string
    createdByName: string
    updatedAt: Date | null
    updatedBy: string | null
    updatedByName: string | null
  }): DepartmentResponse {
    return {
      id: department.id,
      name: department.name,
      status: department.status as Status,
      createdAt: department.createdAt,
      createdBy: department.createdBy,
      createdByName: department.createdByName,
      updatedAt: department.updatedAt,
      updatedBy: department.updatedBy,
      updatedByName: department.updatedByName
    }
  }

  static async getAll(
    includeRelations = false,
    pagination?: PaginationParams,
    filters?: DepartmentFilters
  ): Promise<DepartmentResponse[] | DepartmentWithRelations[] | PaginationResult<DepartmentResponse> | PaginationResult<DepartmentWithRelations>> {
    const where: Prisma.DepartmentWhereInput = {}

    if (filters) {
      if (filters.search) {
        where.name = { contains: filters.search, mode: 'insensitive' }
      }

      if (filters.status !== undefined) {
        where.status = filters.status
      }
    }

    const includeConfig = includeRelations
      ? {
          sections: {
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
          },
          users: {
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
          }
        }
      : undefined

    if (pagination) {
      const paginationOptions = calculatePagination(pagination)

      const [departments, total] = await Promise.all([
        prisma.department.findMany({
          where,
          include: includeConfig,
          ...paginationOptions
        }),
        prisma.department.count({ where })
      ])

      const formattedDepartments = departments.map((dept) => {
        const base = this.formatDepartmentResponse(dept)
        if (includeRelations && 'sections' in dept && 'users' in dept) {
          return {
            ...base,
            sections: dept.sections,
            users: dept.users
          } as DepartmentWithRelations
        }
        return base
      })

      return formatPaginationResponse(formattedDepartments, total, pagination)
    }

    const departments = await prisma.department.findMany({
      where,
      include: includeConfig,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return departments.map((dept) => {
      const base = this.formatDepartmentResponse(dept)
      if (includeRelations && 'sections' in dept && 'users' in dept) {
        return {
          ...base,
          sections: dept.sections,
          users: dept.users
        } as DepartmentWithRelations
      }
      return base
    })
  }

  static async getById(id: number, includeRelations = false): Promise<DepartmentResponse | DepartmentWithRelations> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: includeRelations
        ? {
          sections: {
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
          },
          users: {
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
          }
        }
        : undefined
    })

    if (!department) {
      throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound)
    }

    const base = this.formatDepartmentResponse(department)
    if (includeRelations && 'sections' in department && 'users' in department) {
      return {
        ...base,
        sections: department.sections,
        users: department.users
      } as DepartmentWithRelations
    }
    return base
  }

  static async create(name: string, createdBy: string): Promise<DepartmentResponse> {
    const existing = await prisma.department.findFirst({
      where: { name }
    })

    if (existing) {
      throw new ConflictError(CODES.DEPARTMENT_NAME_EXISTS, MSG.errors.department.nameExists)
    }

    const createdByName = await getUserFullName(createdBy)

    const department = await prisma.department.create({
      data: {
        name,
        createdBy,
        createdByName,
        updatedAt: null,
        updatedBy: null
      }
    })

    return this.formatDepartmentResponse(department)
  }

  static async update(
    id: number,
    data: { name?: string; status?: 'active' | 'inactive' },
    updatedBy: string
  ): Promise<DepartmentResponse> {
    if (data.name) {
      const existing = await prisma.department.findFirst({
        where: {
          name: data.name,
          id: { not: id }
        }
      })

      if (existing) {
        throw new ConflictError(CODES.DEPARTMENT_NAME_EXISTS, MSG.errors.department.nameExists)
      }
    }

    const updatedByName = await getUserFullName(updatedBy)

    try {
      const department = await prisma.department.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
          updatedBy,
          updatedByName
        }
      })

      return this.formatDepartmentResponse(department)
    } catch (originalError) {
      throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound, undefined, originalError)
    }
  }

  static async delete(id: number): Promise<void> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sections: true, users: true }
        }
      }
    })

    if (!department) {
      throw new NotFoundError(CODES.DEPARTMENT_NOT_FOUND, MSG.errors.department.notFound)
    }

    if (department._count.users > 0) {
      throw new ConflictError(CODES.DEPARTMENT_HAS_USERS, MSG.errors.department.hasUsers, { count: department._count.users })
    }

    if (department._count.sections > 0) {
      throw new ConflictError(CODES.DEPARTMENT_HAS_SECTIONS, MSG.errors.department.hasSections, { count: department._count.sections })
    }

    await prisma.department.delete({
      where: { id }
    })
  }
}

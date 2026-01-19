import { prisma } from '../lib/prisma'
import { NotFoundError, ConflictError } from '../lib/errors'
import type { DepartmentResponse, DepartmentWithRelations, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
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
    updatedAt: Date | null
  }): DepartmentResponse {
    return {
      id: department.id,
      name: department.name,
      status: department.status as Status,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt
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
              updatedAt: true
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
              updatedAt: true
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
      throw new NotFoundError('Department not found')
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
      throw new ConflictError('Department name already exists')
    }

    const department = await prisma.department.create({
      data: {
        name,
        createdBy
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
        throw new ConflictError('Department name already exists')
      }
    }

    try {
      const department = await prisma.department.update({
        where: { id },
        data: {
          ...data,
          updatedBy
        }
      })

      return this.formatDepartmentResponse(department)
    } catch {
      throw new NotFoundError('Department not found')
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await prisma.department.delete({
        where: { id }
      })
    } catch {
      throw new NotFoundError('Department not found or has related records')
    }
  }
}

import { prisma } from '../lib/prisma'
import { NotFoundError, ConflictError } from '../lib/errors'
import type { SectionResponse, SectionWithRelations, Status } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import type { Prisma } from '@prisma/client'

export interface SectionFilters {
  search?: string
  departmentId?: number
  status?: 'active' | 'inactive'
}

export class SectionService {
  private static formatSectionResponse(section: {
    id: number
    departmentId: number
    name: string
    status: string
    createdAt: Date
    updatedAt: Date | null
  }): SectionResponse {
    return {
      id: section.id,
      departmentId: section.departmentId,
      name: section.name,
      status: section.status as Status,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt
    }
  }

  static async getAll(
    includeRelations = false,
    pagination?: PaginationParams,
    filters?: SectionFilters
  ): Promise<SectionResponse[] | SectionWithRelations[] | PaginationResult<SectionResponse> | PaginationResult<SectionWithRelations>> {
    const where: Prisma.SectionWhereInput = {}

    if (filters) {
      if (filters.search) {
        where.name = { contains: filters.search, mode: 'insensitive' }
      }

      if (filters.departmentId !== undefined) {
        where.departmentId = filters.departmentId
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

      const [sections, total] = await Promise.all([
        prisma.section.findMany({
          where,
          include: includeConfig,
          ...paginationOptions
        }),
        prisma.section.count({ where })
      ])

      const formattedSections = sections.map((section) => {
        const base = this.formatSectionResponse(section)
        if (includeRelations && 'department' in section && 'users' in section) {
          return {
            ...base,
            department: section.department,
            users: section.users
          } as SectionWithRelations
        }
        return base
      })

      return formatPaginationResponse(formattedSections, total, pagination)
    }

    const sections = await prisma.section.findMany({
      where,
      include: includeConfig,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return sections.map((section) => {
      const base = this.formatSectionResponse(section)
      if (includeRelations && 'department' in section && 'users' in section) {
        return {
          ...base,
          department: section.department,
          users: section.users
        } as SectionWithRelations
      }
      return base
    })
  }

  static async getById(id: number, includeRelations = false): Promise<SectionResponse | SectionWithRelations> {
    const section = await prisma.section.findUnique({
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

    if (!section) {
      throw new NotFoundError('Section not found')
    }

    const base = this.formatSectionResponse(section)
    if (includeRelations && 'department' in section && 'users' in section) {
      return {
        ...base,
        department: section.department,
        users: section.users
      } as SectionWithRelations
    }
    return base
  }

  static async getByDepartment(departmentId: number): Promise<SectionResponse[]> {
    const sections = await prisma.section.findMany({
      where: { departmentId },
      orderBy: { name: 'asc' }
    })

    return sections.map(this.formatSectionResponse)
  }

  static async create(
    departmentId: number,
    name: string,
    createdBy: string
  ): Promise<SectionResponse> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      throw new NotFoundError('Department not found')
    }

    const existing = await prisma.section.findFirst({
      where: {
        departmentId,
        name
      }
    })

    if (existing) {
      throw new ConflictError('Section name already exists in this department')
    }

    const section = await prisma.section.create({
      data: {
        departmentId,
        name,
        createdBy
      }
    })

    return this.formatSectionResponse(section)
  }

  static async update(
    id: number,
    data: { departmentId?: number; name?: string; status?: 'active' | 'inactive' },
    updatedBy: string
  ): Promise<SectionResponse> {
    if (data.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: data.departmentId }
      })

      if (!department) {
        throw new NotFoundError('Department not found')
      }
    }

    if (data.name || data.departmentId) {
      const existing = await prisma.section.findFirst({
        where: {
          departmentId: data.departmentId,
          name: data.name,
          id: { not: id }
        }
      })

      if (existing) {
        throw new ConflictError('Section name already exists in this department')
      }
    }

    try {
      const section = await prisma.section.update({
        where: { id },
        data: {
          ...data,
          updatedBy
        }
      })

      return this.formatSectionResponse(section)
    } catch {
      throw new NotFoundError('Section not found')
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await prisma.section.delete({
        where: { id }
      })
    } catch {
      throw new NotFoundError('Section not found or has related records')
    }
  }
}

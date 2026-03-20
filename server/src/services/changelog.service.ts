import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import type { ChangelogResponse } from '../types'
import { calculatePagination, formatPaginationResponse, type PaginationParams, type PaginationResult } from '../utils/pagination.utils'
import { getUserFullName } from '../utils/audit.utils'
import type { Prisma } from '@prisma/client'

export interface ChangelogFilters {
  search?: string
  updateType?: 'FEATURE' | 'BUGFIX' | 'IMPROVEMENT' | 'SECURITY' | 'OTHER'
  startDate?: string
  endDate?: string
}

export class ChangelogService {
  private static formatResponse(log: {
    id: number
    title: string
    description: string | null
    updateType: string
    gitRef: string | null
    updatedDate: Date
    createdAt: Date
    createdBy: string
    createdByName: string
    updatedAt: Date | null
    updatedBy: string | null
    updatedByName: string | null
  }): ChangelogResponse {
    return {
      id: log.id,
      title: log.title,
      description: log.description,
      updateType: log.updateType,
      gitRef: log.gitRef,
      updatedDate: log.updatedDate,
      createdAt: log.createdAt,
      createdBy: log.createdBy,
      createdByName: log.createdByName,
      updatedAt: log.updatedAt,
      updatedBy: log.updatedBy,
      updatedByName: log.updatedByName,
    }
  }

  private static buildWhereClause(filters?: ChangelogFilters): Prisma.ChangelogWhereInput {
    const where: Prisma.ChangelogWhereInput = {}

    if (filters?.search) {
      where.title = { contains: filters.search, mode: 'insensitive' }
    }

    if (filters?.updateType) {
      where.updateType = filters.updateType
    }

    if (filters?.startDate || filters?.endDate) {
      where.updatedDate = {}
      if (filters.startDate) {
        where.updatedDate.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.updatedDate.lte = new Date(filters.endDate)
      }
    }

    return where
  }

  static async getAll(
    pagination: PaginationParams,
    filters?: ChangelogFilters
  ): Promise<PaginationResult<ChangelogResponse>> {
    const where = this.buildWhereClause(filters)
    const paginationOptions = calculatePagination(pagination)

    const [logs, total] = await Promise.all([
      prisma.changelog.findMany({
        where,
        ...paginationOptions,
      }),
      prisma.changelog.count({ where }),
    ])

    const formatted = logs.map((log) => this.formatResponse(log))
    return formatPaginationResponse(formatted, total, pagination)
  }

  static async getById(id: number): Promise<ChangelogResponse> {
    const log = await prisma.changelog.findUnique({
      where: { id },
    })

    if (!log) {
      throw new NotFoundError(CODES.CHANGELOG_NOT_FOUND, MSG.errors.changelog.notFound)
    }

    return this.formatResponse(log)
  }

  static async create(
    data: {
      title: string
      description?: string
      updateType: 'FEATURE' | 'BUGFIX' | 'IMPROVEMENT' | 'SECURITY' | 'OTHER'
      gitRef?: string
      updatedDate: string
    },
    createdBy: string
  ): Promise<ChangelogResponse> {
    const createdByName = await getUserFullName(createdBy)

    const log = await prisma.changelog.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        updateType: data.updateType,
        gitRef: data.gitRef ?? null,
        updatedDate: new Date(data.updatedDate),
        createdBy,
        createdByName,
        updatedAt: null,
        updatedBy: null,
      },
    })

    return this.formatResponse(log)
  }

  static async update(
    id: number,
    data: {
      title?: string
      description?: string | null
      updateType?: 'FEATURE' | 'BUGFIX' | 'IMPROVEMENT' | 'SECURITY' | 'OTHER'
      gitRef?: string | null
      updatedDate?: string
    },
    updatedBy: string
  ): Promise<ChangelogResponse> {
    const existing = await prisma.changelog.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError(CODES.CHANGELOG_NOT_FOUND, MSG.errors.changelog.notFound)
    }

    const updatedByName = await getUserFullName(updatedBy)

    const updateData: Prisma.ChangelogUpdateInput = {
      updatedAt: new Date(),
      updatedBy,
      updatedByName,
    }

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.updateType !== undefined) updateData.updateType = data.updateType
    if (data.gitRef !== undefined) updateData.gitRef = data.gitRef
    if (data.updatedDate !== undefined) updateData.updatedDate = new Date(data.updatedDate)

    const log = await prisma.changelog.update({
      where: { id },
      data: updateData,
    })

    return this.formatResponse(log)
  }

  static async delete(id: number): Promise<void> {
    const existing = await prisma.changelog.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError(CODES.CHANGELOG_NOT_FOUND, MSG.errors.changelog.notFound)
    }

    await prisma.changelog.delete({ where: { id } })
  }
}

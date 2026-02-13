import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import type { ActionType, Role, Status, UserLogResponse } from '../types'
import {
  calculatePagination,
  formatPaginationResponse,
  type PaginationParams,
  type PaginationResult
} from '../utils/pagination.utils'
import type { Prisma, ActionType as PrismaActionType } from '@prisma/client'

export interface UserLogFilters {
  username?: string
  actionType?: PrismaActionType
  startDate?: string
  endDate?: string
}

export class UserLogService {
  private static formatUserLogResponse(log: {
    id: number
    username: string
    firstName: string
    lastName: string
    department: string
    section: string
    email: string | null
    tel: string | null
    role: string
    status: string
    createdAt: Date
    createdBy: string
    updatedAt: Date | null
    updatedBy: string | null
    actionType: string
    actionAt: Date
  }): UserLogResponse {
    return {
      id: log.id,
      username: log.username,
      firstName: log.firstName,
      lastName: log.lastName,
      department: log.department,
      section: log.section,
      email: log.email,
      tel: log.tel,
      role: log.role as Role,
      status: log.status as Status,
      createdAt: log.createdAt,
      createdBy: log.createdBy,
      updatedAt: log.updatedAt,
      updatedBy: log.updatedBy,
      actionType: log.actionType as ActionType,
      actionAt: log.actionAt
    }
  }

  static async getAll(
    pagination: PaginationParams,
    filters?: UserLogFilters
  ): Promise<PaginationResult<UserLogResponse>> {
    const where: Prisma.UserLogWhereInput = {}

    if (filters) {
      if (filters.username) {
        where.username = filters.username
      }

      if (filters.actionType) {
        where.actionType = filters.actionType
      }

      if (filters.startDate || filters.endDate) {
        where.actionAt = {}
        if (filters.startDate) {
          where.actionAt.gte = new Date(filters.startDate)
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate)
          endDate.setHours(23, 59, 59, 999)
          where.actionAt.lte = endDate
        }
      }
    }

    const paginationOptions = calculatePagination(pagination)

    const [logs, total] = await Promise.all([
      prisma.userLog.findMany({
        where,
        ...paginationOptions
      }),
      prisma.userLog.count({ where })
    ])

    const formattedLogs = logs.map((log) => this.formatUserLogResponse(log))

    return formatPaginationResponse(formattedLogs, total, pagination)
  }

  static async getById(id: number): Promise<UserLogResponse> {
    const log = await prisma.userLog.findUnique({
      where: { id }
    })

    if (!log) {
      throw new NotFoundError('User log not found')
    }

    return this.formatUserLogResponse(log)
  }

  static async getByUsername(
    username: string,
    pagination: PaginationParams
  ): Promise<PaginationResult<UserLogResponse>> {
    const where: Prisma.UserLogWhereInput = { username }
    const paginationOptions = calculatePagination(pagination)

    const [logs, total] = await Promise.all([
      prisma.userLog.findMany({
        where,
        ...paginationOptions
      }),
      prisma.userLog.count({ where })
    ])

    const formattedLogs = logs.map((log) => this.formatUserLogResponse(log))

    return formatPaginationResponse(formattedLogs, total, pagination)
  }
}

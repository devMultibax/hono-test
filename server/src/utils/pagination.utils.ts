import { z } from 'zod';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PrismaQueryOptions {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Pagination query schema for validating request query parameters
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Calculate pagination values for Prisma queries
 */
export function calculatePagination(params: PaginationParams): PrismaQueryOptions {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const result: PrismaQueryOptions = {
    skip,
    take: limit,
  };

  if (params.sort) {
    result.orderBy = {
      [params.sort]: params.order || 'asc',
    };
  }

  return result;
}

/**
 * Format pagination response
 */
export function formatPaginationResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): {
  valid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  if (params.page !== undefined && params.page < 1) {
    errors.push('Page must be greater than 0');
  }

  if (params.limit !== undefined) {
    if (params.limit < 1) {
      errors.push('Limit must be greater than 0');
    }
    if (params.limit > 100) {
      errors.push('Limit must not exceed 100');
    }
  }

  if (params.order && !['asc', 'desc'].includes(params.order)) {
    errors.push('Order must be either "asc" or "desc"');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Create cursor-based pagination options (for future use with large datasets)
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  pagination: {
    nextCursor?: string;
    hasMore: boolean;
    limit: number;
  };
}

/**
 * Format cursor-based pagination response (prepared for future use)
 */
export function formatCursorPaginationResponse<T extends { id: string }>(
  data: T[],
  limit: number
): CursorPaginationResult<T> {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore ? items[items.length - 1].id : undefined;

  return {
    data: items,
    pagination: {
      nextCursor,
      hasMore,
      limit,
    },
  };
}

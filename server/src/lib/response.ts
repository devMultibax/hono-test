import { Context } from 'hono'
import type { ApiErrorResponse } from '../types'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export function successResponse<T>(c: Context, data: T, statusCode: ContentfulStatusCode = 200) {
  // Don't double-wrap PaginationResult (already has { data: [], pagination: {} } shape)
  if (data !== null && typeof data === 'object' && 'pagination' in data && 'data' in data) {
    return c.json(data as object, statusCode)
  }
  return c.json({ data }, statusCode)
}

export function errorResponse(c: Context, error: ApiErrorResponse['error'], statusCode: ContentfulStatusCode = 500) {
  return c.json({ error }, statusCode)
}

export function createdResponse<T>(c: Context, data: T) {
  return c.json({ data }, 201)
}

export function noContentResponse(c: Context) {
  return c.body(null, 204)
}

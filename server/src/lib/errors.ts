import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { CODES } from '../constants/error-codes'

export class AppError extends Error {
  constructor(
    public statusCode: ContentfulStatusCode,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = CODES.VALIDATION_ERROR, details?: unknown) {
    super(400, message, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = CODES.AUTH_UNAUTHORIZED) {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = CODES.NOT_FOUND) {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = CODES.CONFLICT, details?: unknown) {
    super(409, message, details)
    this.name = 'ConflictError'
  }
}

export function toHTTPException(error: unknown): HTTPException {
  if (error instanceof AppError) {
    return new HTTPException(error.statusCode, { message: error.message })
  }

  if (error instanceof Error) {
    return new HTTPException(500, { message: error.message })
  }

  return new HTTPException(500, { message: CODES.INTERNAL_SERVER_ERROR })
}

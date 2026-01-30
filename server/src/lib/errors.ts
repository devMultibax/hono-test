import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { MESSAGES } from '../constants/message'

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
  constructor(message: string = MESSAGES.ERROR.VALIDATION_ERROR, details?: unknown) {
    super(400, message, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = MESSAGES.AUTH.UNAUTHORIZED) {
    super(401, message)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = MESSAGES.ERROR.RESOURCE_NOT_FOUND) {
    super(404, message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = MESSAGES.ERROR.CONFLICT) {
    super(409, message)
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

  return new HTTPException(500, { message: MESSAGES.ERROR.INTERNAL_SERVER_ERROR })
}

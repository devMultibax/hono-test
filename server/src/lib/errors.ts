import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { CODES } from '../constants/error-codes'

export class AppError extends Error {
  public readonly code: string

  constructor(
    public statusCode: ContentfulStatusCode,
    code: string,
    public userMessage: string,
    public details?: unknown,
    public override cause?: unknown,
  ) {
    super(code)
    this.name = 'AppError'
    this.code = code
  }
}

export class ValidationError extends AppError {
  constructor(code: string = CODES.VALIDATION_ERROR, userMessage = 'ข้อมูลไม่ถูกต้อง', details?: unknown) {
    super(400, code, userMessage, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: string = CODES.AUTH_UNAUTHORIZED, userMessage = 'ไม่มีสิทธิ์เข้าถึง') {
    super(401, code, userMessage)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends AppError {
  constructor(code: string = CODES.NOT_FOUND, userMessage = 'ไม่พบข้อมูลที่ร้องขอ', details?: unknown, cause?: unknown) {
    super(404, code, userMessage, details, cause)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(code: string = CODES.CONFLICT, userMessage = 'ข้อมูลขัดแย้ง', details?: unknown) {
    super(409, code, userMessage, details)
    this.name = 'ConflictError'
  }
}

export function toHTTPException(error: unknown): HTTPException {
  if (error instanceof AppError) {
    return new HTTPException(error.statusCode, { message: error.userMessage })
  }

  if (error instanceof Error) {
    return new HTTPException(500, { message: error.message })
  }

  return new HTTPException(500, { message: CODES.INTERNAL_SERVER_ERROR })
}

import type { Context } from 'hono'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'
import { errorResponse } from '../lib/response'
import { env } from '../config/env'

export const errorHandler = (error: Error, c: Context) => {
  if (error instanceof ZodError) {
    return errorResponse(
      c,
      {
        error: 'Validation error',
        details: error.issues
      },
      400
    )
  }

  if (error instanceof AppError) {
    return errorResponse(
      c,
      {
        error: error.message,
        details: error.details
      },
      error.statusCode
    )
  }

  console.error('Unhandled error:', error)

  return errorResponse(
    c,
    {
      error: 'Internal server error',
      details: env.NODE_ENV === 'development' ? error.message : undefined
    },
    500
  )
}

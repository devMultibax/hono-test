import type { Context } from 'hono'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'
import { errorResponse } from '../lib/response'
import { env } from '../config/env'
import { CODES } from '../constants/error-codes'
import { LogEvent } from '../constants/log-events'
import type { HonoContext } from '../types'

export const errorHandler = (error: Error, c: Context) => {
  const logWarn  = (c as Context<HonoContext>).get('logWarn')
  const logError = (c as Context<HonoContext>).get('logError')

  if (error instanceof ZodError) {
    logWarn?.(LogEvent.SYS_VALIDATION_FAILED, {
      issues: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    })
    return errorResponse(
      c,
      {
        code: CODES.VALIDATION_ERROR,
        message: 'Input validation failed',
        details: error.issues
      },
      400
    )
  }

  if (error instanceof AppError) {
    const logData = {
      errorCode:  error.code,
      statusCode: error.statusCode,
      details:    error.details,
      cause:      error.cause instanceof Error ? error.cause.message : error.cause,
      stack:      error.stack,
    }

    if (error.statusCode >= 500) {
      logError?.(LogEvent.SYS_SERVER_ERROR, logData)
    } else {
      logWarn?.(LogEvent.SYS_REQUEST_ERROR(error.code), logData)
    }

    return errorResponse(
      c,
      {
        code:    error.code,
        message: error.userMessage,
        details: error.details
      },
      error.statusCode
    )
  }

  logError?.(LogEvent.SYS_UNHANDLED_ERROR, {
    name:    error.name,
    message: error.message,
    stack:   error.stack,
  })

  return errorResponse(
    c,
    {
      code: CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: env.NODE_ENV === 'development' ? error.message : undefined
    },
    500
  )
}

import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { AuthService } from '../services/auth.service'
import { UnauthorizedError } from '../lib/errors'
import { errorResponse } from '../lib/response'
import { env } from '../config/env'
import { CODES } from '../constants/error-codes'
import type { AuthPayload, HonoContext } from '../types'

export const authMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const token = getCookie(c, env.JWT_COOKIE_NAME)

  if (!token) {
    return errorResponse(c, { code: CODES.AUTH_MISSING_TOKEN, message: 'Authentication token is missing' }, 401)
  }

  try {
    const decoded = await AuthService.verifyToken(token)
    c.set('user', decoded as AuthPayload)
    await next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(c, { code: error.message, message: error.message }, 401)
    }
    return errorResponse(c, { code: CODES.AUTH_UNAUTHORIZED, message: 'Unauthorized' }, 401)
  }
}
import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { AuthService } from '../services/auth.service'
import { UnauthorizedError } from '../lib/errors'
import { errorResponse } from '../lib/response'
import { env } from '../config/env'
import { MESSAGES } from '../constants/message'
import type { AuthPayload, HonoContext } from '../types'

export const authMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const token = getCookie(c, env.JWT_COOKIE_NAME)

  if (!token) {
    return errorResponse(c, { error: MESSAGES.AUTH.MISSING_TOKEN }, 401)
  }

  try {
    const decoded = await AuthService.verifyToken(token)
    c.set('user', decoded as AuthPayload)
    await next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(c, { error: error.message }, 401)
    }
    return errorResponse(c, { error: MESSAGES.AUTH.UNAUTHORIZED }, 401)
  }
}
import type { Context, Next } from 'hono'
import { AuthService } from '../services/auth.service'
import { UnauthorizedError } from '../lib/errors'
import { errorResponse } from '../lib/response'
import type { AuthPayload } from '../types'

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(c, { error: 'Missing or invalid authorization header' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const decoded = AuthService.verifyToken(token)
    c.set('user', decoded as AuthPayload)
    await next()
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return errorResponse(c, { error: error.message }, 401)
    }
    return errorResponse(c, { error: 'Unauthorized' }, 401)
  }
}
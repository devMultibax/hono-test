import type { Context, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { CsrfUtils } from '../lib/csrf-utils'
import { errorResponse } from '../lib/response'

const CSRF_SECRET_COOKIE = 'csrf_secret'
const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export const csrfProtection = async (c: Context, next: Next) => {
  const method = c.req.method

  if (SAFE_METHODS.includes(method)) {
    await next()
    return
  }

  let secret = getCookie(c, CSRF_SECRET_COOKIE)

  if (!secret) {
    return errorResponse(c, { error: 'CSRF secret not found' }, 403)
  }

  const token = c.req.header(CSRF_TOKEN_HEADER)

  if (!token) {
    return errorResponse(c, { error: 'CSRF token missing' }, 403)
  }

  const isValid = CsrfUtils.verifyToken(token, secret)

  if (!isValid) {
    return errorResponse(c, { error: 'Invalid CSRF token' }, 403)
  }

  await next()
}

export const generateCsrfToken = (c: Context): string => {
  let secret = getCookie(c, CSRF_SECRET_COOKIE)

  if (!secret) {
    secret = CsrfUtils.generateSecret()
    setCookie(c, CSRF_SECRET_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_COOKIE_MAX_AGE,
      path: '/'
    })
  }

  return CsrfUtils.generateToken(secret)
}

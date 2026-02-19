import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { loginSchema } from '../schemas/user'
import { AuthService } from '../services/auth.service'
import { successResponse } from '../lib/response'
import { authMiddleware } from '../middleware/auth'
import { loginRateLimiter } from '../middleware/rate-limit'
import { generateCsrfToken, csrfProtection } from '../middleware/csrf'
import { env } from '../config/env'
import { CODES } from '../constants/error-codes'
import { UnauthorizedError } from '../lib/errors'
import type { HonoContext } from '../types'

const auth = new Hono<HonoContext>()

auth.get('/csrf-token', (c) => {
  const token = generateCsrfToken(c)
  return successResponse(c, { csrfToken: token })
})

auth.post('/login', loginRateLimiter, csrfProtection, async (c) => {
  const body = await c.req.json()
  const validated = loginSchema.parse(body)

  try {
    const result = await AuthService.login(validated.username, validated.password)

    setCookie(c, env.JWT_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      maxAge: env.JWT_COOKIE_MAX_AGE / 1000, // Convert milliseconds to seconds
      path: '/'
    })

    if (result.previousSessionTerminated) {
      c.get('logWarn')('Session replaced: logged in from another device', {
        username: validated.username,
        fullName: '-',
      })
    }

    c.get('logInfo')('Login successful', { username: validated.username })

    return successResponse(c, { user: result.user, code: CODES.AUTH_LOGIN_SUCCESS })
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      c.get('logWarn')(`Login failed: ${error.message}`, {
        username: validated.username,
        fullName: '-',
      })
    }
    throw error
  }
})

auth.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user')

  c.get('logInfo')('Logout successful')

  await AuthService.logout(user.id)

  deleteCookie(c, env.JWT_COOKIE_NAME, {
    path: '/'
  })

  return successResponse(c, { code: CODES.AUTH_LOGOUT_SUCCESS })
})

// Get current authenticated user
auth.get('/me', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const user = await AuthService.getCurrentUser(currentUser.id)
  return successResponse(c, { user })
})

// Update current authenticated user's profile
auth.put('/me', authMiddleware, csrfProtection, async (c) => {
  const currentUser = c.get('user')
  const body = await c.req.json()

  const { updateProfileSchema } = await import('../schemas/auth.schema')
  const validated = updateProfileSchema.parse(body)

  const user = await AuthService.updateProfile(currentUser.id, validated)
  return successResponse(c, { code: CODES.AUTH_PROFILE_UPDATE_SUCCESS, user })
})

// Change current authenticated user's password
auth.put('/me/password', authMiddleware, csrfProtection, async (c) => {
  const currentUser = c.get('user')
  const body = await c.req.json()

  const { changePasswordSchema } = await import('../schemas/user')
  const validated = changePasswordSchema.parse(body)

  const { UserService } = await import('../services/user.service')
  const user = await UserService.changePassword(
    currentUser.id,
    validated.currentPassword,
    validated.newPassword
  )

  return successResponse(c, { code: CODES.AUTH_PASSWORD_CHANGE_SUCCESS, user })
})

export default auth

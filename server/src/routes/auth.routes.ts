import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { loginSchema } from '../schemas/user'
import { AuthService } from '../services/auth.service'
import { successResponse } from '../lib/response'
import { authMiddleware } from '../middleware/auth'
import { loginRateLimiter } from '../middleware/rate-limit'
import { generateCsrfToken, csrfProtection } from '../middleware/csrf'
import { env } from '../config/env'
import type { HonoContext } from '../types'

const auth = new Hono<HonoContext>()

auth.get('/csrf-token', (c) => {
  const token = generateCsrfToken(c)
  return successResponse(c, { csrfToken: token })
})

auth.post('/login', loginRateLimiter, csrfProtection, async (c) => {
  const body = await c.req.json()
  const validated = loginSchema.parse(body)

  const result = await AuthService.login(validated.username, validated.password)

  setCookie(c, env.JWT_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.JWT_COOKIE_MAX_AGE / 1000, // Convert milliseconds to seconds
    path: '/'
  })

  return successResponse(c, { user: result.user })
})

auth.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user')

  await AuthService.logout(user.id)

  deleteCookie(c, env.JWT_COOKIE_NAME, {
    path: '/'
  })

  return successResponse(c, { message: 'Logged out successfully' })
})

// Profile Management Endpoints
auth.get('/me', authMiddleware, async (c) => {
  const currentUser = c.get('user')
  const user = await AuthService.getCurrentUser(currentUser.id)
  return successResponse(c, { user })
})

auth.put('/me', authMiddleware, csrfProtection, async (c) => {
  const currentUser = c.get('user')
  const body = await c.req.json()

  const { updateProfileSchema } = await import('../schemas/auth.schema')
  const validated = updateProfileSchema.parse(body)

  const user = await AuthService.updateProfile(currentUser.id, validated)
  return successResponse(c, { message: 'Profile updated successfully', user })
})

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

  return successResponse(c, { message: 'Password changed successfully', user })
})

export default auth

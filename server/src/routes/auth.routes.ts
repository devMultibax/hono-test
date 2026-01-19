import { Hono } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import { registerSchema, loginSchema } from '../schemas/user'
import { AuthService } from '../services/auth.service'
import { successResponse, createdResponse } from '../lib/response'
import { authMiddleware } from '../middleware/auth'
import { loginRateLimiter } from '../middleware/rate-limit'
import { generateCsrfToken, csrfProtection } from '../middleware/csrf'
import { env } from '../config/env'
import { Role, type HonoContext } from '../types'

const auth = new Hono<HonoContext>()

auth.get('/csrf-token', (c) => {
  const token = generateCsrfToken(c)
  return successResponse(c, { csrfToken: token })
})

auth.post('/register', csrfProtection, async (c) => {
  const body = await c.req.json()
  const validated = registerSchema.parse(body)

  const result = await AuthService.register({
    username: validated.username,
    password: validated.password,
    firstName: validated.firstName,
    lastName: validated.lastName,
    departmentId: validated.departmentId,
    sectionId: validated.sectionId,
    email: validated.email,
    tel: validated.tel,
    role: validated.role as Role | undefined
  })

  return createdResponse(c, result)
})

auth.post('/login', loginRateLimiter, csrfProtection, async (c) => {
  const body = await c.req.json()
  const validated = loginSchema.parse(body)

  const result = await AuthService.login(validated.username, validated.password)

  setCookie(c, env.JWT_COOKIE_NAME, result.token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: parseInt(env.JWT_COOKIE_MAX_AGE, 10) / 1000,
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

export default auth

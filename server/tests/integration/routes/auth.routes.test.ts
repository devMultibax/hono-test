import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { AuthService } from '../../../src/services/auth.service'
import { UnauthorizedError, NotFoundError } from '../../../src/lib/errors'
import { mockUserResponse, mockAuthPayload } from '../../mocks/data.mock'
import { errorHandler } from '../../../src/middleware/error-handler'

vi.mock('../../../src/services/auth.service')
vi.mock('../../../src/services/user.service')
vi.mock('../../../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    const cookie = c.req.header('Cookie')
    if (cookie?.includes('auth_token=valid')) {
      c.set('user', mockAuthPayload)
      return next()
    }
    return c.json({ error: 'Unauthorized' }, 401)
  })
}))
vi.mock('../../../src/middleware/csrf', () => ({
  csrfProtection: vi.fn((c, next) => next()),
  generateCsrfToken: vi.fn(() => 'mock-csrf-token')
}))
vi.mock('../../../src/middleware/rate-limit', () => ({
  loginRateLimiter: vi.fn((c, next) => next())
}))

async function createTestApp() {
  const authRoutes = (await import('../../../src/routes/auth.routes')).default
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/auth', authRoutes)
  return app
}

describe('Auth Routes', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await createTestApp()
  })

  describe('GET /auth/csrf-token', () => {
    it('should return CSRF token', async () => {
      const res = await app.request('/auth/csrf-token')

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveProperty('csrfToken')
    })
  })

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({
        token: 'mock.jwt.token',
        user: mockUserResponse
      })

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'user01',
          password: 'password123'
        })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.user).toBeDefined()
      expect(res.headers.get('Set-Cookie')).toBeTruthy()
    })

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(
        new UnauthorizedError('Invalid credentials')
      )

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'user01',
          password: 'wrongpassword'
        })
      })

      expect(res.status).toBe(401)
    })

    it('should return 401 for inactive account', async () => {
      vi.mocked(AuthService.login).mockRejectedValue(
        new UnauthorizedError('Account is inactive')
      )

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'user02',
          password: 'password123'
        })
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(AuthService.logout).mockResolvedValue()

      const res = await app.request('/auth/logout', {
        method: 'POST',
        headers: { Cookie: 'auth_token=valid' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('Logged out successfully')
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/auth/logout', {
        method: 'POST'
      })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /auth/me', () => {
    it('should return current user', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUserResponse)

      const res = await app.request('/auth/me', {
        headers: { Cookie: 'auth_token=valid' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.user).toBeDefined()
      expect(data.user.username).toBe('testuser')
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/auth/me')

      expect(res.status).toBe(401)
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(AuthService.getCurrentUser).mockRejectedValue(
        new NotFoundError('User not found')
      )

      const res = await app.request('/auth/me', {
        headers: { Cookie: 'auth_token=valid' }
      })

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /auth/me', () => {
    it('should update profile', async () => {
      const updatedUser = { ...mockUserResponse, firstName: 'Updated' }
      vi.mocked(AuthService.updateProfile).mockResolvedValue(updatedUser)

      const res = await app.request('/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=valid'
        },
        body: JSON.stringify({ firstName: 'Updated' })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.user.firstName).toBe('Updated')
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Updated' })
      })

      expect(res.status).toBe(401)
    })
  })

  describe('PUT /auth/me/password', () => {
    it('should change password', async () => {
      const { UserService } = await import('../../../src/services/user.service')
      vi.mocked(UserService.changePassword).mockResolvedValue(mockUserResponse)

      const res = await app.request('/auth/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=valid'
        },
        body: JSON.stringify({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('Password changed successfully')
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/auth/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123'
        })
      })

      expect(res.status).toBe(401)
    })
  })
})

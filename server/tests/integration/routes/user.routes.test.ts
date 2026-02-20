import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { UserService } from '../../../src/services/user.service'
import { NotFoundError } from '../../../src/lib/errors'
import { Role, Status } from '../../../src/types'
import {
  mockUserResponse,
  mockUserWithRelations,
  mockAdminAuthPayload,
  mockAuthPayload,
  createMockUsers
} from '../../mocks/data.mock'
import { errorHandler } from '../../../src/middleware/error-handler'

vi.mock('../../../src/services/user.service')
vi.mock('../../../src/services/export.service')
vi.mock('../../../src/services/import.service')
vi.mock('../../../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    const cookie = c.req.header('Cookie')
    if (cookie?.includes('auth_token=admin')) {
      c.set('user', mockAdminAuthPayload)
    } else if (cookie?.includes('auth_token=user')) {
      c.set('user', mockAuthPayload)
    } else {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    return next()
  })
}))
vi.mock('../../../src/middleware/csrf', () => ({
  csrfProtection: vi.fn((_, next) => next()),
  generateCsrfToken: vi.fn(() => 'mock-csrf-token')
}))
vi.mock('../../../src/middleware/permission', () => ({
  requireAdmin: vi.fn((c, next) => {
    const user = c.get('user')
    if (user?.role !== Role.ADMIN) {
      return c.json({ error: 'Admin access required' }, 403)
    }
    return next()
  }),
  requireUser: vi.fn((_, next) => next())
}))
vi.mock('../../../src/middleware/upload', () => ({
  parseUpload: vi.fn(),
  validateFile: vi.fn()
}))

async function createTestApp() {
  const userRoutes = (await import('../../../src/routes/user.routes')).default
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/users', userRoutes)
  return app
}

describe('User Routes', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await createTestApp()
  })

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = createMockUsers(3).map(u => ({
        id: u.id,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        departmentId: u.departmentId,
        sectionId: u.sectionId,
        email: u.email,
        tel: u.tel,
        role: u.role as Role,
        status: u.status as Status,
        createdAt: u.createdAt,
        createdBy: 'admin',
        createdByName: 'Admin User',
        updatedAt: null,
        updatedBy: null,
        updatedByName: null,
        lastLoginAt: u.lastLoginAt
      }))
      vi.mocked(UserService.getAll).mockResolvedValue(mockUsers)

      const res = await app.request('/users', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data).toHaveLength(3)
    })

    it('should return users with pagination', async () => {
      vi.mocked(UserService.getAll).mockResolvedValue({
        data: [mockUserResponse],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })

      const res = await app.request('/users?page=1&limit=10', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('pagination')
    })

    it('should filter users by departmentId', async () => {
      vi.mocked(UserService.getAll).mockResolvedValue([mockUserResponse])

      const res = await app.request('/users?departmentId=1', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      expect(UserService.getAll).toHaveBeenCalledWith(
        expect.any(Boolean),
        expect.any(Object),
        expect.objectContaining({ departmentId: 1 })
      )
    })

    it('should filter users by role', async () => {
      vi.mocked(UserService.getAll).mockResolvedValue([mockUserResponse])

      const res = await app.request('/users?role=ADMIN', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      expect(UserService.getAll).toHaveBeenCalledWith(
        expect.any(Boolean),
        expect.any(Object),
        expect.objectContaining({ role: 'ADMIN' })
      )
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/users')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      vi.mocked(UserService.getById).mockResolvedValue(mockUserResponse)

      const res = await app.request('/users/1', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data.id).toBe(1)
    })

    it('should return user with relations when include=true', async () => {
      vi.mocked(UserService.getById).mockResolvedValue(mockUserWithRelations)

      const res = await app.request('/users/1?include=true', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      expect(UserService.getById).toHaveBeenCalledWith(1, true)
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/users/abc', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(400)
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(UserService.getById).mockRejectedValue(
        new NotFoundError('User not found')
      )

      const res = await app.request('/users/999', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(404)
    })
  })

  describe('POST /users', () => {
    it('should create user (admin only)', async () => {
      vi.mocked(UserService.create).mockResolvedValue({ user: mockUserResponse, password: 'mock-password' })

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({
          username: 'user01',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          departmentId: 1
        })
      })

      expect(res.status).toBe(201)
      expect(UserService.create).toHaveBeenCalled()
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({
          username: 'user01',
          password: 'password123',
          firstName: 'New',
          lastName: 'User',
          departmentId: 1
        })
      })

      expect(res.status).toBe(403)
    })
  })

  describe('PUT /users/:id', () => {
    it('should update user (admin only)', async () => {
      const updated = { ...mockUserResponse, firstName: 'Updated' }
      vi.mocked(UserService.update).mockResolvedValue(updated)

      const res = await app.request('/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ firstName: 'Updated' })
      })

      expect(res.status).toBe(200)
      expect(UserService.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ firstName: 'Updated' }),
        'admin'
      )
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/users/abc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ firstName: 'Updated' })
      })

      expect(res.status).toBe(400)
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({ firstName: 'Updated' })
      })

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /users/:id', () => {
    it('should delete user (admin only)', async () => {
      vi.mocked(UserService.delete).mockResolvedValue()

      const res = await app.request('/users/1', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(204)
      expect(UserService.delete).toHaveBeenCalledWith(1)
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/users/abc', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(400)
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/users/1', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(403)
    })

    it('should return 404 when user not found', async () => {
      vi.mocked(UserService.delete).mockRejectedValue(
        new NotFoundError('User not found')
      )

      const res = await app.request('/users/999', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(404)
    })
  })

  describe('POST /users/password/verify', () => {
    it('should verify password', async () => {
      vi.mocked(UserService.verifyPassword).mockResolvedValue(true)

      const res = await app.request('/users/password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({ password: 'password123' })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data?.valid).toBe(true)
    })
  })

  describe('PATCH /users/:id/password/reset', () => {
    it('should reset password (admin only)', async () => {
      vi.mocked(UserService.resetPassword).mockResolvedValue({ user: mockUserResponse, password: 'mock-password' })

      const res = await app.request('/users/1/password/reset', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ newPassword: 'newpassword123' })
      })

      expect(res.status).toBe(200)
      expect(UserService.resetPassword).toHaveBeenCalledWith(1, 'newpassword123', 'admin')
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/users/1/password/reset', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({ newPassword: 'newpassword123' })
      })

      expect(res.status).toBe(403)
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { DepartmentService } from '../../../src/services/department.service'
import { NotFoundError, ConflictError } from '../../../src/lib/errors'
import { Role, Status } from '../../../src/types'
import {
  mockDepartmentResponse,
  mockDepartmentWithRelations,
  mockAdminAuthPayload,
  mockAuthPayload,
  createMockDepartments
} from '../../mocks/data.mock'
import { errorHandler } from '../../../src/middleware/error-handler'

vi.mock('../../../src/services/department.service')
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

async function createTestApp() {
  const departmentRoutes = (await import('../../../src/routes/department.routes')).default
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/departments', departmentRoutes)
  return app
}

describe('Department Routes', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await createTestApp()
  })

  describe('GET /departments', () => {
    it('should return all departments', async () => {
      const mockDepts = createMockDepartments(3).map(d => ({
        id: d.id,
        name: d.name,
        status: d.status as Status,
        createdAt: d.createdAt,
        createdBy: 'admin',
        createdByName: 'Admin User',
        updatedAt: d.updatedAt,
        updatedBy: null,
        updatedByName: null
      }))
      vi.mocked(DepartmentService.getAll).mockResolvedValue(mockDepts)

      const res = await app.request('/departments', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveLength(3)
    })

    it('should return departments with pagination', async () => {
      vi.mocked(DepartmentService.getAll).mockResolvedValue({
        data: [mockDepartmentResponse],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })

      const res = await app.request('/departments?page=1&limit=10', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('pagination')
    })

    it('should return departments with relations when include=true', async () => {
      vi.mocked(DepartmentService.getAll).mockResolvedValue([mockDepartmentWithRelations])

      const res = await app.request('/departments?include=true', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      expect(DepartmentService.getAll).toHaveBeenCalledWith(
        true,
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/departments')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /departments/:id', () => {
    it('should return department by id', async () => {
      vi.mocked(DepartmentService.getById).mockResolvedValue(mockDepartmentResponse)

      const res = await app.request('/departments/1', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.id).toBe(1)
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/departments/abc', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(400)
    })

    it('should return 404 when department not found', async () => {
      vi.mocked(DepartmentService.getById).mockRejectedValue(
        new NotFoundError('Department not found')
      )

      const res = await app.request('/departments/999', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(404)
    })
  })

  describe('POST /departments', () => {
    it('should create department (admin only)', async () => {
      vi.mocked(DepartmentService.create).mockResolvedValue(mockDepartmentResponse)

      const res = await app.request('/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ name: 'New Department' })
      })

      expect(res.status).toBe(201)
      expect(DepartmentService.create).toHaveBeenCalledWith('New Department', 'admin')
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({ name: 'New Department' })
      })

      expect(res.status).toBe(403)
    })

    it('should return 409 when name already exists', async () => {
      vi.mocked(DepartmentService.create).mockRejectedValue(
        new ConflictError('Department name already exists')
      )

      const res = await app.request('/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ name: 'Existing Department' })
      })

      expect(res.status).toBe(409)
    })
  })

  describe('PUT /departments/:id', () => {
    it('should update department (admin only)', async () => {
      const updated = { ...mockDepartmentResponse, name: 'Updated' }
      vi.mocked(DepartmentService.update).mockResolvedValue(updated)

      const res = await app.request('/departments/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ name: 'Updated' })
      })

      expect(res.status).toBe(200)
      expect(DepartmentService.update).toHaveBeenCalledWith(
        1,
        { name: 'Updated' },
        'admin'
      )
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/departments/abc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ name: 'Updated' })
      })

      expect(res.status).toBe(400)
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/departments/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({ name: 'Updated' })
      })

      expect(res.status).toBe(403)
    })
  })

  describe('DELETE /departments/:id', () => {
    it('should delete department (admin only)', async () => {
      vi.mocked(DepartmentService.delete).mockResolvedValue()

      const res = await app.request('/departments/1', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(204)
      expect(DepartmentService.delete).toHaveBeenCalledWith(1)
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/departments/abc', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(400)
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/departments/1', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(403)
    })

    it('should return 404 when department not found', async () => {
      vi.mocked(DepartmentService.delete).mockRejectedValue(
        new NotFoundError('Department not found')
      )

      const res = await app.request('/departments/999', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(404)
    })
  })
})

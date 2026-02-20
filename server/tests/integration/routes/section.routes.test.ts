import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import { SectionService } from '../../../src/services/section.service'
import { NotFoundError, ConflictError } from '../../../src/lib/errors'
import { Role, Status } from '../../../src/types'
import {
  mockSectionResponse,
  mockSectionWithRelations,
  mockAdminAuthPayload,
  mockAuthPayload,
  createMockSections
} from '../../mocks/data.mock'
import { errorHandler } from '../../../src/middleware/error-handler'

vi.mock('../../../src/services/section.service')
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
  const sectionRoutes = (await import('../../../src/routes/section.routes')).default
  const app = new Hono()
  app.onError(errorHandler)
  app.route('/sections', sectionRoutes)
  return app
}

describe('Section Routes', () => {
  let app: Hono

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await createTestApp()
  })

  describe('GET /sections', () => {
    it('should return all sections', async () => {
      const mockSections = createMockSections(3).map(s => ({
        id: s.id,
        departmentId: s.departmentId,
        name: s.name,
        status: s.status as Status,
        createdAt: s.createdAt,
        createdBy: 'admin',
        createdByName: 'Admin User',
        updatedAt: s.updatedAt,
        updatedBy: null,
        updatedByName: null
      }))
      vi.mocked(SectionService.getAll).mockResolvedValue(mockSections)

      const res = await app.request('/sections', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data).toHaveLength(3)
    })

    it('should return sections with pagination', async () => {
      vi.mocked(SectionService.getAll).mockResolvedValue({
        data: [mockSectionResponse],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })

      const res = await app.request('/sections?page=1&limit=10', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('pagination')
    })

    it('should filter sections by departmentId', async () => {
      vi.mocked(SectionService.getAll).mockResolvedValue([mockSectionResponse])

      const res = await app.request('/sections?departmentId=1', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      expect(SectionService.getAll).toHaveBeenCalledWith(
        expect.any(Boolean),
        expect.any(Object),
        expect.objectContaining({ departmentId: 1 })
      )
    })

    it('should return 401 without auth token', async () => {
      const res = await app.request('/sections')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /sections/:id', () => {
    it('should return section by id', async () => {
      vi.mocked(SectionService.getById).mockResolvedValue(mockSectionResponse)

      const res = await app.request('/sections/1', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.data.id).toBe(1)
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/sections/abc', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(400)
    })

    it('should return 404 when section not found', async () => {
      vi.mocked(SectionService.getById).mockRejectedValue(
        new NotFoundError('Section not found')
      )

      const res = await app.request('/sections/999', {
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(404)
    })
  })

  describe('POST /sections', () => {
    it('should create section (admin only)', async () => {
      vi.mocked(SectionService.create).mockResolvedValue(mockSectionResponse)

      const res = await app.request('/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ departmentId: 1, name: 'New Section' })
      })

      expect(res.status).toBe(201)
      expect(SectionService.create).toHaveBeenCalledWith(1, 'New Section', 'admin')
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=user'
        },
        body: JSON.stringify({ departmentId: 1, name: 'New Section' })
      })

      expect(res.status).toBe(403)
    })

    it('should return 404 when department not found', async () => {
      vi.mocked(SectionService.create).mockRejectedValue(
        new NotFoundError('Department not found')
      )

      const res = await app.request('/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ departmentId: 999, name: 'New Section' })
      })

      expect(res.status).toBe(404)
    })

    it('should return 409 when section name already exists', async () => {
      vi.mocked(SectionService.create).mockRejectedValue(
        new ConflictError('Section name already exists in this department')
      )

      const res = await app.request('/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ departmentId: 1, name: 'Existing Section' })
      })

      expect(res.status).toBe(409)
    })
  })

  describe('PUT /sections/:id', () => {
    it('should update section (admin only)', async () => {
      const updated = { ...mockSectionResponse, name: 'Updated' }
      vi.mocked(SectionService.update).mockResolvedValue(updated)

      const res = await app.request('/sections/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'auth_token=admin'
        },
        body: JSON.stringify({ name: 'Updated' })
      })

      expect(res.status).toBe(200)
      expect(SectionService.update).toHaveBeenCalledWith(
        1,
        { name: 'Updated' },
        'admin'
      )
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/sections/abc', {
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
      const res = await app.request('/sections/1', {
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

  describe('DELETE /sections/:id', () => {
    it('should delete section (admin only)', async () => {
      vi.mocked(SectionService.delete).mockResolvedValue()

      const res = await app.request('/sections/1', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(204)
      expect(SectionService.delete).toHaveBeenCalledWith(1)
    })

    it('should return 400 for invalid id', async () => {
      const res = await app.request('/sections/abc', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(400)
    })

    it('should return 403 for non-admin users', async () => {
      const res = await app.request('/sections/1', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=user' }
      })

      expect(res.status).toBe(403)
    })

    it('should return 404 when section not found', async () => {
      vi.mocked(SectionService.delete).mockRejectedValue(
        new NotFoundError('Section not found')
      )

      const res = await app.request('/sections/999', {
        method: 'DELETE',
        headers: { Cookie: 'auth_token=admin' }
      })

      expect(res.status).toBe(404)
    })
  })
})

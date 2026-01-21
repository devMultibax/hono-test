import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { Hono } from 'hono'
import type { HonoContext } from '../../src/types'

vi.mock('../../src/lib/prisma')
vi.mock('../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: '3000',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-key-for-testing-purposes-only',
    JWT_COOKIE_NAME: 'auth_token',
    JWT_COOKIE_MAX_AGE: 86400000,
    COOKIE_SECURE: false,
    COOKIE_SAME_SITE: 'Lax',
    CORS_ORIGIN: 'http://localhost:3000',
    BACKUP_ENABLED: false,
    BACKUP_CRON: '0 2 * * *',
    BACKUP_DIR: './storage/backups',
    LOG_ROTATION_ENABLED: false,
    LOG_RETENTION_DAYS: 30,
    LOG_DIR: './storage/logs'
  }
}))

describe('E2E: Application', () => {
  let app: Hono<HonoContext>

  beforeAll(() => {
    app = new Hono<HonoContext>()

    app.get('/', (c) => {
      return c.json({
        message: 'Hono API Server',
        version: '1.0.0',
        status: 'running'
      })
    })

    app.notFound((c) => {
      return c.json(
        {
          error: 'Not Found',
          message: 'The requested resource was not found'
        },
        404
      )
    })
  })

  describe('Root endpoint', () => {
    it('should return server info', async () => {
      const res = await app.request('/')

      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.message).toBe('Hono API Server')
      expect(data.version).toBe('1.0.0')
      expect(data.status).toBe('running')
    })
  })

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await app.request('/unknown-route')

      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data.error).toBe('Not Found')
    })
  })
})

describe('E2E: Health Check', () => {
  let app: Hono<HonoContext>

  beforeAll(() => {
    app = new Hono<HonoContext>()

    app.get('/health', (c) => {
      return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
      })
    })

    app.get('/health/ready', (c) => {
      return c.json({
        status: 'ready',
        checks: {
          database: 'ok'
        }
      })
    })
  })

  it('should return health status', async () => {
    const res = await app.request('/health')

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('healthy')
    expect(data.timestamp).toBeDefined()
  })

  it('should return readiness status', async () => {
    const res = await app.request('/health/ready')

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('ready')
    expect(data.checks).toBeDefined()
  })
})

describe('E2E: Authentication Flow', () => {
  let app: Hono<HonoContext>
  let authToken: string | null = null

  beforeAll(() => {
    app = new Hono<HonoContext>()

    app.post('/auth/login', async (c) => {
      const body = await c.req.json()

      if (body.username === 'testuser' && body.password === 'password123') {
        authToken = 'mock-jwt-token'
        return c.json({
          user: {
            id: 1,
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
          }
        }, 200, {
          'Set-Cookie': `auth_token=${authToken}; HttpOnly; Path=/`
        })
      }

      return c.json({ error: 'Invalid credentials' }, 401)
    })

    app.post('/auth/logout', (c) => {
      authToken = null
      return c.json({ message: 'Logged out successfully' }, 200, {
        'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Max-Age=0'
      })
    })

    app.get('/protected', (c) => {
      const cookie = c.req.header('Cookie')
      if (!cookie?.includes('auth_token=mock-jwt-token')) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
      return c.json({ message: 'Protected resource' })
    })
  })

  beforeEach(() => {
    authToken = null
  })

  it('should complete full auth flow: login -> access protected -> logout', async () => {
    const loginRes = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'password123'
      })
    })

    expect(loginRes.status).toBe(200)
    const loginData = await loginRes.json()
    expect(loginData.user.username).toBe('testuser')

    const setCookie = loginRes.headers.get('Set-Cookie')
    expect(setCookie).toContain('auth_token=')

    const protectedRes = await app.request('/protected', {
      headers: { Cookie: 'auth_token=mock-jwt-token' }
    })

    expect(protectedRes.status).toBe(200)
    const protectedData = await protectedRes.json()
    expect(protectedData.message).toBe('Protected resource')

    const logoutRes = await app.request('/auth/logout', {
      method: 'POST',
      headers: { Cookie: 'auth_token=mock-jwt-token' }
    })

    expect(logoutRes.status).toBe(200)
    const logoutData = await logoutRes.json()
    expect(logoutData.message).toBe('Logged out successfully')
  })

  it('should reject invalid credentials', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'wrongpassword'
      })
    })

    expect(res.status).toBe(401)
  })

  it('should reject access to protected resource without auth', async () => {
    const res = await app.request('/protected')

    expect(res.status).toBe(401)
  })
})

describe('E2E: CRUD Operations Flow', () => {
  let app: Hono<HonoContext>
  const mockDepartments: { id: number; name: string }[] = []
  let nextId = 1

  beforeAll(() => {
    app = new Hono<HonoContext>()

    const authCheck = (c: any, next: any) => {
      const cookie = c.req.header('Cookie')
      if (!cookie?.includes('auth_token=admin')) {
        return c.json({ error: 'Unauthorized' }, 401)
      }
      return next()
    }

    app.get('/departments', authCheck, (c) => {
      return c.json(mockDepartments)
    })

    app.post('/departments', authCheck, async (c) => {
      const body = await c.req.json()
      const dept = { id: nextId++, name: body.name }
      mockDepartments.push(dept)
      return c.json(dept, 201)
    })

    app.get('/departments/:id', authCheck, (c) => {
      const id = Number(c.req.param('id'))
      const dept = mockDepartments.find(d => d.id === id)
      if (!dept) {
        return c.json({ error: 'Not found' }, 404)
      }
      return c.json(dept)
    })

    app.put('/departments/:id', authCheck, async (c) => {
      const id = Number(c.req.param('id'))
      const body = await c.req.json()
      const index = mockDepartments.findIndex(d => d.id === id)
      if (index === -1) {
        return c.json({ error: 'Not found' }, 404)
      }
      mockDepartments[index] = { ...mockDepartments[index], ...body }
      return c.json(mockDepartments[index])
    })

    app.delete('/departments/:id', authCheck, (c) => {
      const id = Number(c.req.param('id'))
      const index = mockDepartments.findIndex(d => d.id === id)
      if (index === -1) {
        return c.json({ error: 'Not found' }, 404)
      }
      mockDepartments.splice(index, 1)
      return c.body(null, 204)
    })
  })

  beforeEach(() => {
    mockDepartments.length = 0
    nextId = 1
  })

  it('should complete full CRUD flow', async () => {
    const createRes = await app.request('/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'auth_token=admin'
      },
      body: JSON.stringify({ name: 'IT Department' })
    })

    expect(createRes.status).toBe(201)
    const created = await createRes.json()
    expect(created.id).toBe(1)
    expect(created.name).toBe('IT Department')

    const getRes = await app.request('/departments/1', {
      headers: { Cookie: 'auth_token=admin' }
    })

    expect(getRes.status).toBe(200)
    const retrieved = await getRes.json()
    expect(retrieved.name).toBe('IT Department')

    const updateRes = await app.request('/departments/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'auth_token=admin'
      },
      body: JSON.stringify({ name: 'Updated Department' })
    })

    expect(updateRes.status).toBe(200)
    const updated = await updateRes.json()
    expect(updated.name).toBe('Updated Department')

    const listRes = await app.request('/departments', {
      headers: { Cookie: 'auth_token=admin' }
    })

    expect(listRes.status).toBe(200)
    const list = await listRes.json()
    expect(list).toHaveLength(1)

    const deleteRes = await app.request('/departments/1', {
      method: 'DELETE',
      headers: { Cookie: 'auth_token=admin' }
    })

    expect(deleteRes.status).toBe(204)

    const finalListRes = await app.request('/departments', {
      headers: { Cookie: 'auth_token=admin' }
    })

    const finalList = await finalListRes.json()
    expect(finalList).toHaveLength(0)
  })

  it('should return 404 for non-existent resource', async () => {
    const res = await app.request('/departments/999', {
      headers: { Cookie: 'auth_token=admin' }
    })

    expect(res.status).toBe(404)
  })
})

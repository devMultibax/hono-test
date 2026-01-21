import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import type { AuthPayload, HonoContext } from '../../src/types'

const TEST_JWT_SECRET = 'test-secret-key-for-testing-purposes-only'

export function generateTestToken(payload: AuthPayload): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' })
}

export function createTestApp(): Hono<HonoContext> {
  return new Hono<HonoContext>()
}

export function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}

export async function makeRequest(
  app: Hono<HonoContext>,
  method: string,
  path: string,
  options: {
    body?: unknown
    token?: string
    csrfToken?: string
    headers?: Record<string, string>
  } = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (options.token) {
    headers['Cookie'] = `auth_token=${options.token}`
  }

  if (options.csrfToken) {
    headers['X-CSRF-Token'] = options.csrfToken
  }

  const requestInit: RequestInit = {
    method,
    headers
  }

  if (options.body) {
    requestInit.body = JSON.stringify(options.body)
  }

  return app.request(path, requestInit)
}

export function expectStatus(response: Response, status: number): void {
  if (response.status !== status) {
    throw new Error(`Expected status ${status}, got ${response.status}`)
  }
}

export function expectJsonContentType(response: Response): void {
  const contentType = response.headers.get('Content-Type')
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON content type, got ${contentType}`)
  }
}

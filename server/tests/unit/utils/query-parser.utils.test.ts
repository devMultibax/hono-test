import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { extractBaseQuery, extractQueryParams } from '../../../src/utils/query-parser.utils'

/** Creates a minimal Hono context with predefined query params */
function makeCtx(queryParams: Record<string, string>): Context {
  const url = new URL('http://localhost/test')
  for (const [k, v] of Object.entries(queryParams)) {
    url.searchParams.set(k, v)
  }

  const app = new Hono()
  let captured: Context | null = null

  app.get('/test', (c) => {
    captured = c
    return c.text('ok')
  })

  const req = new Request(url.toString())
  // We need to spin up the app handler synchronously — use the fetch method
  return {
    req: {
      query: (key: string) => url.searchParams.get(key) ?? undefined,
    },
  } as unknown as Context
}

describe('query-parser.utils', () => {
  describe('extractBaseQuery', () => {
    it('returns all five base params from the context', () => {
      const c = makeCtx({
        page: '2',
        limit: '20',
        sort: 'name',
        order: 'desc',
        search: 'admin',
      })

      const result = extractBaseQuery(c)

      expect(result).toEqual({
        page: '2',
        limit: '20',
        sort: 'name',
        order: 'desc',
        search: 'admin',
      })
    })

    it('returns undefined for params not present in the query string', () => {
      const c = makeCtx({})

      const result = extractBaseQuery(c)

      expect(result.page).toBeUndefined()
      expect(result.limit).toBeUndefined()
      expect(result.sort).toBeUndefined()
      expect(result.order).toBeUndefined()
      expect(result.search).toBeUndefined()
    })

    it('returns only the provided params and undefined for the rest', () => {
      const c = makeCtx({ page: '1', search: 'hello' })

      const result = extractBaseQuery(c)

      expect(result.page).toBe('1')
      expect(result.search).toBe('hello')
      expect(result.limit).toBeUndefined()
    })
  })

  describe('extractQueryParams', () => {
    it('extracts specified fields from the query string', () => {
      const c = makeCtx({ status: 'active', departmentId: '3', page: '1' })

      const result = extractQueryParams(c, ['status', 'departmentId', 'page', 'missing'])

      expect(result).toEqual({
        status: 'active',
        departmentId: '3',
        page: '1',
        missing: undefined,
      })
    })

    it('returns an empty object when no fields are requested', () => {
      const c = makeCtx({ foo: 'bar' })

      const result = extractQueryParams(c, [])

      expect(result).toEqual({})
    })
  })
})

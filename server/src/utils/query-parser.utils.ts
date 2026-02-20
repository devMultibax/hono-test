import type { Context } from 'hono'

/**
 * Raw string representation of base pagination + search query params.
 * Pass this object (spread or as-is) to a Zod list query schema's `.parse()`.
 */
export interface BaseQueryRaw {
  page: string | undefined
  limit: string | undefined
  sort: string | undefined
  order: string | undefined
  search: string | undefined
}

/**
 * Extracts the common pagination + search query params (page, limit, sort, order, search)
 * from a Hono request context as raw strings, ready to be spread into a Zod schema parse call.
 *
 * Reduces the repetitive boilerplate across list endpoints.
 *
 * @example
 * // Before
 * const queryParams = listUsersQuerySchema.parse({
 *   page: c.req.query('page'),
 *   limit: c.req.query('limit'),
 *   sort: c.req.query('sort'),
 *   order: c.req.query('order'),
 *   search: c.req.query('search'),
 *   status: c.req.query('status'),
 * })
 *
 * // After
 * const queryParams = listUsersQuerySchema.parse({
 *   ...extractBaseQuery(c),
 *   status: c.req.query('status'),
 * })
 */
export function extractBaseQuery(c: Context): BaseQueryRaw {
  return {
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
  }
}

/**
 * Extracts an arbitrary set of named query params from a Hono request context.
 * Use when you need fields beyond the base pagination params.
 *
 * @example
 * const queryParams = mySchema.parse(
 *   extractQueryParams(c, ['page', 'limit', 'sort', 'order', 'search', 'status', 'departmentId'])
 * )
 */
export function extractQueryParams(
  c: Context,
  fields: string[]
): Record<string, string | undefined> {
  return Object.fromEntries(fields.map((field) => [field, c.req.query(field)]))
}

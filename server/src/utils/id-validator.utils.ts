import { ValidationError } from '../lib/errors'

// ─── Types ────────────────────────────────────────────────────────────────────

type ParseIdSuccess = { id: number }
type ParseIdError = { error: string }
type ParseIdResult = ParseIdSuccess | ParseIdError

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Parses a route parameter string into a positive integer ID.
 *
 * Returns `{ id }` on success or `{ error }` on failure — does **not** throw.
 * Useful when you need to handle the error yourself.
 *
 * @example
 * const result = parseRouteId(c.req.param('id'))
 * if ('error' in result) return c.json({ error: result.error }, 400)
 * const { id } = result
 */
export function parseRouteId(raw: string | undefined): ParseIdResult {
  if (!raw) {
    return { error: 'ID parameter is required' }
  }

  const id = Number(raw)

  if (!Number.isInteger(id) || isNaN(id) || id <= 0) {
    return { error: `Invalid ID: "${raw}" must be a positive integer` }
  }

  return { id }
}

/**
 * Parses a route parameter string into a positive integer ID and **throws**
 * a `ValidationError` (handled by the global error handler) if invalid.
 *
 * Prefer this in route handlers to keep them lean — no manual error-check needed.
 *
 * @param raw       - Raw route param string (e.g. `c.req.param('id')`)
 * @param errorCode - Error code from `CODES` to include in the thrown error
 *
 * @throws {ValidationError} when the value is not a positive integer
 *
 * @example
 * // Before
 * const id = Number(c.req.param('id'))
 * if (isNaN(id)) return c.json({ error: CODES.USER_INVALID_ID }, 400)
 *
 * // After
 * const id = requireRouteId(c.req.param('id'), CODES.USER_INVALID_ID)
 */
export function requireRouteId(raw: string | undefined, errorCode: string): number {
  const result = parseRouteId(raw)

  if ('error' in result) {
    throw new ValidationError(errorCode, result.error)
  }

  return result.id
}

/**
 * Alias for `requireRouteId` — kept for readability in route handlers.
 *
 * @example
 * const id = parseIdParam(c.req.param('id'), CODES.USER_INVALID_ID)
 */
export const parseIdParam = requireRouteId


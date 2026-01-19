import { rateLimiter } from 'hono-rate-limiter'

export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  },
  handler: (c) => {
    return c.json(
      {
        error: 'Too many login attempts. Please try again later.'
      },
      429
    )
  }
})

export const generalApiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  },
  handler: (c) => {
    return c.json(
      {
        error: 'Too many requests. Please try again later.'
      },
      429
    )
  }
})

export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  },
  handler: (c) => {
    return c.json(
      {
        error: 'Too many requests. Please try again later.'
      },
      429
    )
  }
})

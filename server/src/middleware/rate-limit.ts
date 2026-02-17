import { rateLimiter } from 'hono-rate-limiter'
import { getIpAddress } from '../lib/get-ip'

export const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getIpAddress(c),
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
  keyGenerator: (c) => getIpAddress(c),
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
  keyGenerator: (c) => getIpAddress(c),
  handler: (c) => {
    return c.json(
      {
        error: 'Too many requests. Please try again later.'
      },
      429
    )
  }
})

import { rateLimiter } from 'hono-rate-limiter'
import type { Context } from 'hono'
import { getIpAddress } from '../lib/get-ip'
import type { HonoContext } from '../types'
import { minutesToMs } from '../utils/time.utils'

export const loginRateLimiter = rateLimiter({
  windowMs: minutesToMs(15),
  limit: 15,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getIpAddress(c),
  handler: (c) => {
    ;(c as Context<HonoContext>).get('logWarn')('Rate limit exceeded: too many login attempts')
    return c.json(
      {
        error: 'Too many login attempts. Please try again later.'
      },
      429
    )
  }
})

export const generalApiRateLimiter = rateLimiter({
  windowMs: minutesToMs(15),
  limit: 100,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getIpAddress(c),
  handler: (c) => {
    ;(c as Context<HonoContext>).get('logWarn')('Rate limit exceeded: too many API requests')
    return c.json(
      {
        error: 'Too many requests. Please try again later.'
      },
      429
    )
  }
})

export const strictRateLimiter = rateLimiter({
  windowMs: minutesToMs(15),
  limit: 10,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => getIpAddress(c),
  handler: (c) => {
    ;(c as Context<HonoContext>).get('logWarn')('Rate limit exceeded: strict limit reached')
    return c.json(
      {
        error: 'Too many requests. Please try again later.'
      },
      429
    )
  }
})

import { cors as honoCors } from 'hono/cors'
import { env } from '../config/env'

const DEV_DEFAULT_ORIGIN = 'http://localhost:5173'

/** CORS preflight cache duration in seconds (10 minutes) */
const CORS_MAX_AGE = 600

const getValidOrigin = (origin: string): string => {
  if (env.NODE_ENV === 'production') {
    const isAllowed = env.ALLOW_ORIGINS.includes(origin)
    return isAllowed ? origin : env.ALLOW_ORIGINS[0]
  }

  return origin || DEV_DEFAULT_ORIGIN
}

export const corsMiddleware = honoCors({
  origin: getValidOrigin,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposeHeaders: ['Content-Length', 'Content-Disposition'],
  maxAge: CORS_MAX_AGE,
  credentials: true
})

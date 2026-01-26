import { cors as honoCors } from 'hono/cors'
import { env } from '../config/env'

export const corsMiddleware = honoCors({
  origin: env.NODE_ENV === 'production'
    ? (env.ALLOW_ORIGINS.length > 0 ? env.ALLOW_ORIGINS : ['https://yourdomain.com'])
    : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true
})

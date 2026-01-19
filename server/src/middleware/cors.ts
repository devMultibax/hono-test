import { cors as honoCors } from 'hono/cors'
import { env } from '../config/env'

export const corsMiddleware = honoCors({
  origin: env.NODE_ENV === 'production'
    ? ['https://yourdomain.com'] // แก้ไข URL ให้ตรงกับ production domain
    : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true
})

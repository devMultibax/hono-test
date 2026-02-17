import type { Context, Next } from 'hono'
import { env } from '../config/env'
import { logger } from '../lib/logger'
import { getIpAddress } from '../lib/get-ip'
import type { AuthPayload } from '../types'
import type { HonoContext } from '../types'

export const logMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const method = c.req.method
  const url = new URL(c.req.url).pathname
  const ip = getIpAddress(c)

  const getUser = (): { username: string; fullName: string } => {
    try {
      const user = c.get('user') as AuthPayload | undefined
      if (user) {
        return {
          username: user.username,
          fullName: `${user.firstName} ${user.lastName}`,
        }
      }
    } catch {
      // No user context
    }
    return { username: 'anonymous', fullName: '-' }
  }

  // Attach log methods to context
  c.set('logInfo', (event: string, additionalData?: Record<string, unknown>) => {
    const { username, fullName } = getUser()
    logger.info({
      username: (additionalData?.username as string) ?? username,
      fullName: (additionalData?.fullName as string) ?? fullName,
      method,
      url,
      ip,
      event,
      ...additionalData,
    })
  })

  c.set('logWarn', (event: string, additionalData?: Record<string, unknown>) => {
    const { username, fullName } = getUser()
    logger.warn({
      username: (additionalData?.username as string) ?? username,
      fullName: (additionalData?.fullName as string) ?? fullName,
      method,
      url,
      ip,
      event,
      ...additionalData,
    })
  })

  c.set('logError', (event: string, additionalData?: Record<string, unknown>) => {
    const { username, fullName } = getUser()
    logger.error({
      username: (additionalData?.username as string) ?? username,
      fullName: (additionalData?.fullName as string) ?? fullName,
      method,
      url,
      ip,
      event,
      ...additionalData,
    })
  })

  await next()
}

// Console request logger for development
export const requestLogger = async (c: Context, next: Next) => {
  if (env.NODE_ENV !== 'development') {
    await next()
    return
  }

  const start = Date.now()
  const method = c.req.method
  const path = new URL(c.req.url).pathname

  await next()

  const duration = Date.now() - start
  const status = c.res.status

  const statusColor =
    status >= 500
      ? '\x1b[31m'
      : status >= 400
      ? '\x1b[33m'
      : status >= 300
      ? '\x1b[36m'
      : '\x1b[32m'

  console.log(
    `${statusColor}${method}\x1b[0m ${path} - ${statusColor}${status}\x1b[0m [${duration}ms]`
  )
}

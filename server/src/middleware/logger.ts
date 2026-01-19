import type { Context, Next } from 'hono'
import { env } from '../config/env'

export const requestLogger = async (c: Context, next: Next) => {
  if (env.NODE_ENV === 'production') {
    await next()
    return
  }

  const start = Date.now()
  const { method, url } = c.req

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
    `${statusColor}${method}\x1b[0m ${url} - ${statusColor}${status}\x1b[0m [${duration}ms]`
  )
}

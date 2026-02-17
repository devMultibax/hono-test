import type { Context } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'

export const getIpAddress = (c: Context): string => {
  const forwardedFor = c.req.header('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  const realIp = c.req.header('x-real-ip')
  if (realIp) return realIp

  try {
    const info = getConnInfo(c)
    if (info.remote.address) {
      const addr = info.remote.address
      if (addr === '::1') return '127.0.0.1'
      if (addr.startsWith('::ffff:')) return addr.slice(7)
      return addr
    }
  } catch {
    // getConnInfo might not work in all environments
  }

  return '-'
}

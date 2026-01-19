import type { Context, Next, MiddlewareHandler } from 'hono'
import { errorResponse } from '../lib/response'
import { Role, type HonoContext } from '../types'

/**
 * Middleware สำหรับตรวจสอบ role ของ user
 * สามารถระบุ role ที่อนุญาตได้หลายๆ role
 *
 * @example
 * // อนุญาตเฉพาะ ADMIN
 * app.post('/admin-only', requireRole(Role.ADMIN), async (c) => {...})
 *
 * @example
 * // อนุญาต ADMIN และ MANAGER
 * app.get('/data', requireRole(Role.ADMIN, Role.MANAGER), async (c) => {...})
 */
export const requireRole = (...allowedRoles: Role[]): MiddlewareHandler => {
  return async (c: Context<HonoContext>, next: Next) => {
    const user = c.get('user')

    if (!user) {
      return errorResponse(c, { error: 'Unauthorized' }, 401)
    }

    if (!allowedRoles.includes(user.role)) {
      return errorResponse(
        c,
        {
          error: 'Forbidden',
          details: 'You do not have permission to access this resource'
        },
        403
      )
    }

    await next()
  }
}

// Helper functions สำหรับ role ที่ใช้บ่อย
export const requireAdmin = requireRole(Role.ADMIN)
export const requireUser = requireRole(Role.USER, Role.ADMIN)

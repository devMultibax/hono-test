import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { AuthService } from '../services/auth.service'
import { SystemSettingsService } from '../services/system-settings.service'
import { env } from '../config/env'
import { Role } from '../types'

// Routes ที่ยกเว้นจาก maintenance mode
const EXEMPT_PATHS = [
  '/auth',               // Login/Logout
  '/system-settings',    // Toggle maintenance
  '/health',             // Health check
]

export const maintenanceMiddleware = async (c: Context, next: Next) => {
  try {
    const isMaintenance = await SystemSettingsService.isMaintenanceMode()

    if (!isMaintenance) {
      return next() // ระบบเปิดปกติ
    }

    // ตรวจ exempt paths
    const path = c.req.path
    if (EXEMPT_PATHS.some((exempt) => path.startsWith(exempt))) {
      return next()
    }

    // ตรวจว่า user เป็น Admin หรือไม่ (ถ้ามี token)
    const isAdmin = await checkAdminFromToken(c)
    if (isAdmin) {
      return next() // Admin ผ่านได้เสมอ
    }

    // ส่ง 503 Service Unavailable
    const message = await SystemSettingsService.getMaintenanceMessage()
    return c.json(
      {
        error: 'Service Unavailable',
        maintenance: true,
        message,
      },
      503
    )
  } catch {
    // fail-open: ถ้าตรวจสอบไม่ได้ → ปล่อยผ่าน
    return next()
  }
}

async function checkAdminFromToken(c: Context): Promise<boolean> {
  try {
    const token = getCookie(c, env.JWT_COOKIE_NAME)
    if (!token) return false
    const decoded = await AuthService.verifyToken(token)
    return decoded.role === Role.ADMIN
  } catch {
    return false
  }
}

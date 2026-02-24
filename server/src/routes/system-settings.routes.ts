import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { SystemSettingsService, SETTING_KEYS } from '../services/system-settings.service'
import { updateSystemSettingSchema } from '../schemas/system-settings.schema'
import { successResponse } from '../lib/response'
import { LogEvent } from '../constants/log-events'
import type { HonoContext } from '../types'

const systemSettings = new Hono<HonoContext>()

// ── Public: ตรวจสอบ maintenance status (ไม่ต้อง login) ──
systemSettings.get('/maintenance/status', async (c) => {
  const status = await SystemSettingsService.getMaintenanceStatus()
  return successResponse(c, status)
})

// ── Protected: Admin only ──
systemSettings.use('/*', authMiddleware)
systemSettings.use('/*', csrfProtection)

systemSettings.get('/', requireAdmin, async (c) => {
  const settings = await SystemSettingsService.getAll()
  return successResponse(c, settings)
})

systemSettings.get('/:key', requireAdmin, async (c) => {
  const key = c.req.param('key')
  const setting = await SystemSettingsService.getByKey(key)
  return successResponse(c, setting)
})

systemSettings.put('/:key', requireAdmin, async (c) => {
  const user = c.get('user')
  const key = c.req.param('key')
  const body = await c.req.json()
  const validated = updateSystemSettingSchema.parse(body)

  const setting = await SystemSettingsService.updateByKey(
    key,
    validated.value,
    user.username
  )

  // Log specific event for maintenance_mode toggle
  if (key === SETTING_KEYS.MAINTENANCE_MODE) {
    const isEnabled = validated.value === 'true'
    if (isEnabled) {
      c.get('logWarn')(LogEvent.SETTINGS_MAINTENANCE_ON)
    } else {
      c.get('logInfo')(LogEvent.SETTINGS_MAINTENANCE_OFF)
    }
  } else {
    c.get('logInfo')(LogEvent.SETTINGS_UPDATED(key))
  }

  return successResponse(c, setting)
})

export default systemSettings

import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { getUserFullName } from '../utils/audit.utils'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import type { SystemSettingResponse, MaintenanceStatusResponse } from '../types'

// Setting keys constants
export const SETTING_KEYS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  MAINTENANCE_MESSAGE: 'maintenance_message',
} as const

export class SystemSettingsService {
  // ── In-memory cache to reduce DB load ──
  // Middleware runs on every request → querying DB each time would be too expensive
  private static cache: Map<string, { value: string; expiresAt: number }> = new Map()
  private static CACHE_TTL = 30_000 // 30 seconds

  // Fetch all settings (Admin page)
  static async getAll(): Promise<SystemSettingResponse[]> {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { id: 'asc' },
    })
    return settings
  }

  // Fetch setting by key
  static async getByKey(key: string): Promise<SystemSettingResponse> {
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    })
    if (!setting) throw new NotFoundError(CODES.SYSTEM_SETTINGS_NOT_FOUND, MSG.errors.systemSetting.notFound)
    return setting
  }

  // Update setting (Admin only) + invalidate cache
  static async updateByKey(
    key: string,
    value: string,
    updatedBy: string
  ): Promise<SystemSettingResponse> {
    const existing = await prisma.systemSetting.findUnique({ where: { key } })
    if (!existing) {
      throw new NotFoundError(CODES.SYSTEM_SETTINGS_NOT_FOUND, MSG.errors.systemSetting.notFound)
    }

    const updatedByName = await getUserFullName(updatedBy)

    const setting = await prisma.systemSetting.update({
      where: { key },
      data: {
        value,
        updatedAt: new Date(),
        updatedBy,
        updatedByName,
      },
    })

    this.cache.delete(key)
    return setting
  }

  // ── Public status endpoint ──
  static async getMaintenanceStatus(): Promise<MaintenanceStatusResponse> {
    const isMaintenance = await this.isMaintenanceMode()
    const message = isMaintenance ? await this.getMaintenanceMessage() : null
    return { maintenance: isMaintenance, message }
  }

  // ── Cached helpers for middleware ──

  static async isMaintenanceMode(): Promise<boolean> {
    const value = await this.getCachedValue(SETTING_KEYS.MAINTENANCE_MODE)
    return value === 'true'
  }

  static async getMaintenanceMessage(): Promise<string> {
    return (
      (await this.getCachedValue(SETTING_KEYS.MAINTENANCE_MESSAGE)) ??
      CODES.SYSTEM_MAINTENANCE_ACTIVE
    )
  }

  private static async getCachedValue(key: string): Promise<string | null> {
    const cached = this.cache.get(key)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value
    }

    try {
      const setting = await prisma.systemSetting.findUnique({ where: { key } })
      const value = setting?.value ?? null
      if (value !== null) {
        this.cache.set(key, { value, expiresAt: Date.now() + this.CACHE_TTL })
      }
      return value
    } catch {
      return null // fail-open: if DB is down → allow through
    }
  }
}

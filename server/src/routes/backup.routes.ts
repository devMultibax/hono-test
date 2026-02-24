import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/permission'
import { strictRateLimiter } from '../middleware/rate-limit'
import { BackupService } from '../services/backup.service'
import { createBackupSchema } from '../schemas/backup.schema'
import { successResponse, createdResponse } from '../lib/response'
import { LogEvent } from '../constants/log-events'
import type { HonoContext } from '../types'

const backupRoutes = new Hono<HonoContext>()

backupRoutes.use('/*', authMiddleware)
backupRoutes.use('/*', requireAdmin)

// Get all backups
backupRoutes.get('/', async (c) => {
  const backups = await BackupService.getBackups()
  return successResponse(c, { backups, total: backups.length })
})

// Create backup
backupRoutes.post('/', strictRateLimiter, zValidator('json', createBackupSchema), async (c) => {
  const { prefix } = c.req.valid('json')
  const result = await BackupService.createBackup(prefix)
  c.get('logInfo')(LogEvent.BACKUP_CREATED(result.filename))
  return createdResponse(c, {
    message: 'Backup created successfully',
    ...result
  })
})

// Restore backup
backupRoutes.post('/:filename/restore', strictRateLimiter, async (c) => {
  const filename = c.req.param('filename')
  await BackupService.restoreBackup(filename)
  c.get('logInfo')(LogEvent.BACKUP_RESTORED(filename))
  return successResponse(c, { message: 'Database restored successfully' })
})

export default backupRoutes

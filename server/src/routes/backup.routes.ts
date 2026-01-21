import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { stream } from 'hono/streaming'
import { createReadStream } from 'fs'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/permission'
import { BackupService } from '../services/backup.service'
import { createBackupSchema } from '../schemas/backup.schema'
import { successResponse, createdResponse } from '../lib/response'
import type { HonoContext } from '../types'

const backupRoutes = new Hono<HonoContext>()

backupRoutes.use('/*', authMiddleware)
backupRoutes.use('/*', requireAdmin)

backupRoutes.get('/', async (c) => {
  const backups = await BackupService.getBackups()
  return successResponse(c, { backups, total: backups.length })
})

backupRoutes.post('/', zValidator('json', createBackupSchema), async (c) => {
  const { prefix } = c.req.valid('json')
  const result = await BackupService.createBackup(prefix)
  return createdResponse(c, {
    message: 'Backup created successfully',
    ...result
  })
})

backupRoutes.get('/:filename', async (c) => {
  const filename = c.req.param('filename')
  const { filePath, size } = await BackupService.getBackupInfo(filename)

  c.header('Content-Type', 'application/sql')
  c.header('Content-Disposition', `attachment; filename="${filename}"`)
  c.header('Content-Length', size.toString())

  return stream(c, async (s) => {
    const fileStream = createReadStream(filePath)
    for await (const chunk of fileStream) {
      await s.write(chunk)
    }
  })
})

backupRoutes.post('/:filename/restore', async (c) => {
  const filename = c.req.param('filename')
  await BackupService.restoreBackup(filename)
  return successResponse(c, { message: 'Database restored successfully' })
})

backupRoutes.delete('/:filename', async (c) => {
  const filename = c.req.param('filename')
  await BackupService.deleteBackup(filename)
  return successResponse(c, { message: 'Backup deleted successfully' })
})

export default backupRoutes

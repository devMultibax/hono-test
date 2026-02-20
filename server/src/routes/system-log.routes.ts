import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/permission'
import { SystemLogService } from '../services/system-log.service'
import { logQuerySchema } from '../schemas/system-log.schema'
import { successResponse } from '../lib/response'
import { CODES } from '../constants/error-codes'
import type { HonoContext } from '../types'

const systemLogRoutes = new Hono<HonoContext>()

systemLogRoutes.use('/*', authMiddleware)
systemLogRoutes.use('/*', requireAdmin)

// Get system logs with optional filtering
systemLogRoutes.get('/', zValidator('query', logQuerySchema), async (c) => {
    const query = c.req.valid('query')
    const logs = await SystemLogService.getLogs(query)
    return successResponse(c, logs)
})

// Get available log files
systemLogRoutes.get('/files', async (c) => {
    const files = await SystemLogService.getLogFiles()
    return successResponse(c, { files, total: files.length })
})

// Delete old logs
systemLogRoutes.delete('/cleanup', async (c) => {
    const deletedCount = await SystemLogService.cleanupOldLogs()
    return successResponse(c, {
        code: CODES.SYSTEM_LOG_CLEANUP_SUCCESS,
        deletedCount
    })
})

export default systemLogRoutes

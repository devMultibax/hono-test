import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/permission'
import { DatabaseService } from '../services/database.service'
import { successResponse } from '../lib/response'
import type { HonoContext } from '../types'

const databaseRoutes = new Hono<HonoContext>()

databaseRoutes.use('/*', authMiddleware)
databaseRoutes.use('/*', requireAdmin)

databaseRoutes.get('/statistics', async (c) => {
  const statistics = await DatabaseService.getStatistics()
  return successResponse(c, statistics)
})

databaseRoutes.post('/analyze', async (c) => {
  const result = await DatabaseService.analyze()
  return successResponse(c, result)
})

export default databaseRoutes

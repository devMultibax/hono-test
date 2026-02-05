import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin } from '../middleware/permission'
import { UserLogService } from '../services/user-log.service'
import { userLogQuerySchema, userLogIdSchema } from '../schemas/user-log.schema'
import { successResponse } from '../lib/response'
import type { HonoContext } from '../types'
import type { ActionType } from '@prisma/client'

const userLogRoutes = new Hono<HonoContext>()

userLogRoutes.use('/*', authMiddleware)
userLogRoutes.use('/*', requireAdmin)

// Get user logs with optional filtering
userLogRoutes.get('/', zValidator('query', userLogQuerySchema), async (c) => {
  const { page, limit, sort, order, username, actionType, startDate, endDate } =
    c.req.valid('query')

  const result = await UserLogService.getAll(
    { page, limit, sort, order },
    { username, actionType: actionType as ActionType | undefined, startDate, endDate }
  )

  return successResponse(c, result)
})

// Get a single user log by ID
userLogRoutes.get(
  '/:id',
  zValidator('param', userLogIdSchema),
  async (c) => {
    const { id } = c.req.valid('param')
    const log = await UserLogService.getById(id)
    return successResponse(c, log)
  }
)

export default userLogRoutes

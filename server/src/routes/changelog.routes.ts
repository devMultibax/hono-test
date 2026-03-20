import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { ChangelogService } from '../services/changelog.service'
import { createChangelogSchema, updateChangelogSchema, listChangelogsQuerySchema } from '../schemas/changelog'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext } from '../types'
import { requireRouteId } from '../utils/id-validator.utils'
import { CODES } from '../constants/error-codes'
import { LogEvent } from '../constants/log-events'

const changelogs = new Hono<HonoContext>()

changelogs.use('/*', authMiddleware)
changelogs.use('/*', csrfProtection)
changelogs.use('/*', requireAdmin)

// Get all changelogs with pagination and filtering
changelogs.get('/', zValidator('query', listChangelogsQuerySchema), async (c) => {
  const { page, limit, sort, order, search, updateType, startDate, endDate } = c.req.valid('query')

  const logList = await ChangelogService.getAll(
    { page, limit, sort, order },
    { search, updateType, startDate, endDate }
  )
  return successResponse(c, logList)
})

// Get a single changelog by ID
changelogs.get('/:id', async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.CHANGELOG_INVALID_ID)
  const log = await ChangelogService.getById(id)
  return successResponse(c, log)
})

// Create a new changelog
changelogs.post('/', zValidator('json', createChangelogSchema), async (c) => {
  const user = c.get('user')
  const validated = c.req.valid('json')

  const log = await ChangelogService.create(validated, user.username)
  c.get('logInfo')(LogEvent.CHANGELOG_CREATED(validated.title))
  return createdResponse(c, log)
})

// Update an existing changelog
changelogs.put('/:id', zValidator('json', updateChangelogSchema), async (c) => {
  const user = c.get('user')
  const id = requireRouteId(c.req.param('id'), CODES.CHANGELOG_INVALID_ID)
  const validated = c.req.valid('json')

  const log = await ChangelogService.update(id, validated, user.username)
  c.get('logInfo')(LogEvent.CHANGELOG_UPDATED(log.title))
  return successResponse(c, log)
})

// Delete a changelog
changelogs.delete('/:id', async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.CHANGELOG_INVALID_ID)
  const log = await ChangelogService.getById(id)
  await ChangelogService.delete(id)
  c.get('logInfo')(LogEvent.CHANGELOG_DELETED(log.title))
  return noContentResponse(c)
})

export default changelogs

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { SectionService } from '../services/section.service'
import { createSectionSchema, updateSectionSchema } from '../schemas/section'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext } from '../types'

const sections = new Hono<HonoContext>()

sections.use('/*', authMiddleware)
sections.use('/*', csrfProtection)

sections.get('/', async (c) => {
  const include = c.req.query('include') === 'true'
  const departmentId = c.req.query('departmentId')

  if (departmentId) {
    const sectionList = await SectionService.getByDepartment(Number(departmentId))
    return successResponse(c, sectionList)
  }

  const sectionList = await SectionService.getAll(include)
  return successResponse(c, sectionList)
})

sections.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  const include = c.req.query('include') === 'true'
  const section = await SectionService.getById(id, include)
  return successResponse(c, section)
})

sections.post('/', requireAdmin, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const validated = createSectionSchema.parse(body)

  const section = await SectionService.create(
    validated.departmentId,
    validated.name,
    user.username
  )
  return createdResponse(c, section)
})

sections.put('/:id', requireAdmin, async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  const body = await c.req.json()
  const validated = updateSectionSchema.parse(body)

  const section = await SectionService.update(id, validated, user.username)
  return successResponse(c, section)
})

sections.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  await SectionService.delete(id)
  return noContentResponse(c)
})

export default sections

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { DepartmentService } from '../services/department.service'
import { createDepartmentSchema, updateDepartmentSchema, listDepartmentsQuerySchema } from '../schemas/department'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext } from '../types'

const departments = new Hono<HonoContext>()

departments.use('/*', authMiddleware)
departments.use('/*', csrfProtection)

departments.get('/', async (c) => {
  const include = c.req.query('include') === 'true'
  const queryParams = listDepartmentsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    status: c.req.query('status')
  })

  const pagination = {
    page: queryParams.page,
    limit: queryParams.limit,
    sort: queryParams.sort,
    order: queryParams.order
  }

  const filters = {
    search: queryParams.search,
    status: queryParams.status
  }

  const departmentList = await DepartmentService.getAll(include, pagination, filters)
  return successResponse(c, departmentList)
})

departments.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid department ID' }, 400)
  }

  const include = c.req.query('include') === 'true'
  const department = await DepartmentService.getById(id, include)
  return successResponse(c, department)
})

departments.post('/', requireAdmin, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const validated = createDepartmentSchema.parse(body)

  const department = await DepartmentService.create(validated.name, user.username)
  return createdResponse(c, department)
})

departments.put('/:id', requireAdmin, async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid department ID' }, 400)
  }

  const body = await c.req.json()
  const validated = updateDepartmentSchema.parse(body)

  const department = await DepartmentService.update(id, validated, user.username)
  return successResponse(c, department)
})

departments.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid department ID' }, 400)
  }

  await DepartmentService.delete(id)
  return noContentResponse(c)
})

export default departments

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin, requireUser } from '../middleware/permission'
import { UserService } from '../services/user.service'
import { updateUserSchema, listUsersQuerySchema } from '../schemas/user'
import { successResponse, noContentResponse } from '../lib/response'
import type { HonoContext, Role, UserWithRelations } from '../types'
import { ExportService } from '../services/export.service'
import { stream } from 'hono/streaming'

const users = new Hono<HonoContext>()

users.use('/*', authMiddleware)
users.use('/*', csrfProtection)

users.get('/', requireUser, async (c) => {
  const include = c.req.query('include') === 'true'
  const queryParams = listUsersQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
    sectionId: c.req.query('sectionId'),
    role: c.req.query('role'),
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
    departmentId: queryParams.departmentId,
    sectionId: queryParams.sectionId,
    role: queryParams.role as Role | undefined,
    status: queryParams.status
  }

  const userList = await UserService.getAll(include, pagination, filters)
  return successResponse(c, userList)
})

users.get('/:id', requireUser, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid user ID' }, 400)
  }

  const include = c.req.query('include') === 'true'
  const user = await UserService.getById(id, include)
  return successResponse(c, user)
})

users.put('/:id', requireAdmin, async (c) => {
  const currentUser = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid user ID' }, 400)
  }

  const body = await c.req.json()
  const validated = updateUserSchema.parse(body)

  const user = await UserService.update(id, validated, currentUser.username)
  return successResponse(c, user)
})

users.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid user ID' }, 400)
  }

  await UserService.delete(id)
  return noContentResponse(c)
})

users.get('/export/excel', requireUser, async (c) => {
  const queryParams = listUsersQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
    sectionId: c.req.query('sectionId'),
    role: c.req.query('role'),
    status: c.req.query('status')
  })

  const filters = {
    search: queryParams.search,
    departmentId: queryParams.departmentId,
    sectionId: queryParams.sectionId,
    role: queryParams.role as Role | undefined,
    status: queryParams.status
  }

  const userList = await UserService.getAll(true, undefined, filters)
  const users = Array.isArray(userList) ? userList : []
  const totalCount = users.length

  const result = await ExportService.exportUsersToExcel(
    users as UserWithRelations[],
    totalCount
  )

  const filename = `users_${new Date().toISOString().split('T')[0]}.xlsx`

  if (ExportService.isStream(result)) {
    return stream(c, async (stream) => {
      c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      c.header('Content-Disposition', `attachment; filename="${filename}"`)

      result.on('data', (chunk) => {
        stream.write(chunk)
      })

      return new Promise((resolve, reject) => {
        result.on('end', () => {
          stream.close()
          resolve()
        })
        result.on('error', reject)
      })
    })
  } else {
    const buffer = await result.xlsx.writeBuffer()
    c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    c.header('Content-Disposition', `attachment; filename="${filename}"`)
    return c.body(buffer)
  }
})

export default users

import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { requireAdmin, requireUser } from '../middleware/permission'
import { UserService } from '../services/user.service'
import { updateUserSchema } from '../schemas/user'
import { successResponse, noContentResponse } from '../lib/response'
import type { HonoContext } from '../types'

const users = new Hono<HonoContext>()

users.use('/*', authMiddleware)

users.get('/', requireUser, async (c) => {
  const include = c.req.query('include') === 'true'
  const userList = await UserService.getAll(include)
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

export default users

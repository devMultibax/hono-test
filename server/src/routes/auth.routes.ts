import { Hono } from 'hono'
import { registerSchema, loginSchema } from '../schemas/user'
import { AuthService } from '../services/auth.service'
import { successResponse, createdResponse } from '../lib/response'
import { Role } from '../types'

const auth = new Hono()

auth.post('/register', async (c) => {
  const body = await c.req.json()
  const validated = registerSchema.parse(body)

  const result = await AuthService.register({
    username: validated.username,
    password: validated.password,
    firstName: validated.firstName,
    lastName: validated.lastName,
    departmentId: validated.departmentId,
    sectionId: validated.sectionId,
    email: validated.email,
    tel: validated.tel,
    role: validated.role as Role | undefined
  })

  return createdResponse(c, result)
})

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const validated = loginSchema.parse(body)

  const result = await AuthService.login(validated.username, validated.password)

  return successResponse(c, result)
})

export default auth

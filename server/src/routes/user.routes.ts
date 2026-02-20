import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin, requireUser } from '../middleware/permission'
import { UserService } from '../services/user.service'
import { registerSchema, updateUserSchema, listUsersQuerySchema } from '../schemas/user'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import { Role, type HonoContext, type UserWithRelations } from '../types'
import { ExportService, userExcelColumns } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { TemplateService } from '../services/template.service'
import { parseUpload, validateFile } from '../middleware/upload'
import { stream } from 'hono/streaming'
import { CODES } from '../constants/error-codes'

const users = new Hono<HonoContext>()

users.use('/*', authMiddleware)
users.use('/*', csrfProtection)

// Create a new User
users.post('/', requireAdmin, async (c) => {
  const currentUser = c.get('user')
  const body = await c.req.json()
  const validated = registerSchema.parse(body)

  const result = await UserService.create(
    validated.username,
    validated.firstName,
    validated.lastName,
    validated.departmentId,
    validated.sectionId ?? null,
    validated.email ?? null,
    validated.tel ?? null,
    validated.role ?? Role.USER,
    currentUser.username
  )

  c.get('logInfo')(`Created user "${validated.username}"`)

  return createdResponse(c, result)
})

// Get all with Pagination and Filters
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

// Download import template
users.get('/template', requireUser, async (c) => {
  const workbook = await TemplateService.generateUserTemplate()
  const buffer = await workbook.xlsx.writeBuffer()
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition', 'attachment; filename="user-import-template.xlsx"')
  return c.body(buffer)
})

// Get a single user by ID
users.get('/:id', requireUser, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: { code: CODES.USER_INVALID_ID, message: 'Invalid user ID' } }, 400)
  }

  const include = c.req.query('include') === 'true'
  const user = await UserService.getById(id, include)
  return successResponse(c, user)
})

// Update an existing user
users.put('/:id', requireAdmin, async (c) => {
  const currentUser = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: { code: CODES.USER_INVALID_ID, message: 'Invalid user ID' } }, 400)
  }

  const body = await c.req.json()
  const validated = updateUserSchema.parse(body)

  const user = await UserService.update(id, validated, currentUser.username)

  c.get('logInfo')(`Updated user #${id}`)

  return successResponse(c, user)
})

// Delete a user
users.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: { code: CODES.USER_INVALID_ID, message: 'Invalid user ID' } }, 400)
  }

  await UserService.delete(id)
  c.get('logInfo')(`Deleted user #${id}`)
  return noContentResponse(c)
})

// Verify Password
users.post('/password/verify', requireUser, async (c) => {
  const currentUser = c.get('user')
  const body = await c.req.json()

  const { verifyPasswordSchema } = await import('../schemas/user')
  const validated = verifyPasswordSchema.parse(body)

  const isValid = await UserService.verifyPassword(currentUser.id, validated.password)
  return successResponse(c, { valid: isValid })
})

// Reset Password
users.patch('/:id/password/reset', requireAdmin, async (c) => {
  const currentUser = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: { code: CODES.USER_INVALID_ID, message: 'Invalid user ID' } }, 400)
  }

  const result = await UserService.resetPassword(id, currentUser.username)
  c.get('logInfo')(`Reset password for user #${id}`)
  return successResponse(c, result)
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
  const userData = Array.isArray(userList) ? userList : []

  const result = await ExportService.exportToExcel(userData as UserWithRelations[], {
    columns: userExcelColumns
  })

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

users.post('/import', requireAdmin, async (c) => {
  const user = c.get('user')
  const file = await parseUpload(c)

  if (!file) {
    return c.json({ error: { code: CODES.USER_NO_FILE_UPLOADED, message: 'No file uploaded' } }, 400)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    return c.json({ error: { code: validation.error, message: validation.error ?? 'File validation failed' } }, 400)
  }

  const fileValidation = ImportService.validateUserFile(file.buffer)

  if (!fileValidation.valid) {
    return c.json({ error: { code: CODES.USER_INVALID_FILE_STRUCTURE, message: 'Invalid file structure', details: fileValidation.errors } }, 400)
  }

  const result = await ImportService.importUsers(file.buffer, user.username)
  c.get('logInfo')(`Imported users: ${result.success} success, ${result.failed} failed`)

  return successResponse(c, {
    imported: result.success,
    failed: result.failed,
    total: result.success + result.failed,
    errors: result.errors
  })
})

export default users

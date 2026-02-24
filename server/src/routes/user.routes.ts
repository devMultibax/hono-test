import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin, requireUser } from '../middleware/permission'
import { UserService } from '../services/user.service'
import { registerSchema, updateUserSchema, listUsersQuerySchema, verifyPasswordSchema } from '../schemas/user'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import { Role, type HonoContext, type UserWithRelations } from '../types'
import { ExportService, userExcelColumns } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { TemplateService } from '../services/template.service'
import { sendExcelResponse } from '../utils/excel-response.utils'
import { resolveUploadedFile } from '../utils/upload-handler.utils'
import { requireRouteId } from '../utils/id-validator.utils'
import { ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { strictRateLimiter } from '../middleware/rate-limit'

const users = new Hono<HonoContext>()

users.use('/*', authMiddleware)
users.use('/*', csrfProtection)

// Create a new User
users.post('/', requireAdmin, zValidator('json', registerSchema), async (c) => {
  const currentUser = c.get('user')
  const validated = c.req.valid('json')

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
users.get('/', requireUser, zValidator('query', listUsersQuerySchema), async (c) => {
  const include = c.req.query('include') === 'true'
  const { page, limit, sort, order, search, departmentId, sectionId, role, status } = c.req.valid('query')

  const userList = await UserService.getAll(
    include,
    { page, limit, sort, order },
    { search, departmentId, sectionId, role: role as Role | undefined, status }
  )
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
  const id = requireRouteId(c.req.param('id'), CODES.USER_INVALID_ID)
  const include = c.req.query('include') === 'true'
  const user = await UserService.getById(id, include)
  return successResponse(c, user)
})

// Update an existing user
users.put('/:id', requireAdmin, zValidator('json', updateUserSchema), async (c) => {
  const currentUser = c.get('user')
  const id = requireRouteId(c.req.param('id'), CODES.USER_INVALID_ID)
  const validated = c.req.valid('json')

  const user = await UserService.update(id, validated, currentUser.username)
  c.get('logInfo')(`Updated user #${id}`)
  return successResponse(c, user)
})

// Delete a user
users.delete('/:id', requireAdmin, async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.USER_INVALID_ID)
  await UserService.delete(id)
  c.get('logInfo')(`Deleted user #${id}`)
  return noContentResponse(c)
})

// Verify Password
users.post('/password/verify', requireUser, strictRateLimiter, zValidator('json', verifyPasswordSchema), async (c) => {
  const currentUser = c.get('user')
  const { password } = c.req.valid('json')
  const isValid = await UserService.verifyPassword(currentUser.id, password)
  return successResponse(c, { valid: isValid })
})

// Reset Password
users.patch('/:id/password/reset', requireAdmin, strictRateLimiter, async (c) => {
  const currentUser = c.get('user')
  const id = requireRouteId(c.req.param('id'), CODES.USER_INVALID_ID)
  const result = await UserService.resetPassword(id, currentUser.username)
  c.get('logInfo')(`Reset password for user #${id}`)
  return successResponse(c, result)
})

// Export to Excel
users.get('/export/excel', requireUser, zValidator('query', listUsersQuerySchema), async (c) => {
  const { search, departmentId, sectionId, role, status } = c.req.valid('query')
  const filters = { search, departmentId, sectionId, role: role as Role | undefined, status }

  const userList = await UserService.getAll(true, undefined, filters)
  const userData = Array.isArray(userList) ? userList : []
  const result = await ExportService.exportToExcel(userData as UserWithRelations[], { columns: userExcelColumns })
  const filename = `users_${new Date().toISOString().split('T')[0]}.xlsx`
  return sendExcelResponse(c, result, filename)
})

// Import from Excel
users.post('/import', requireAdmin, async (c) => {
  const user = c.get('user')
  const file = await resolveUploadedFile(c)

  const fileValidation = ImportService.validateUserFile(file.buffer)
  if (!fileValidation.valid) {
    throw new ValidationError(CODES.USER_INVALID_FILE_STRUCTURE, MSG.errors.import.invalidFileStructure, fileValidation.errors)
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

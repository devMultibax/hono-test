import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { DepartmentService } from '../services/department.service'
import { createDepartmentSchema, updateDepartmentSchema, listDepartmentsQuerySchema } from '../schemas/department'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext, DepartmentResponse } from '../types'
import { ExportService, departmentExcelColumns } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { TemplateService } from '../services/template.service'
import { sendExcelResponse } from '../utils/excel-response.utils'
import { exportTimestamp } from '../lib/export-helpers'
import { resolveUploadedFile } from '../utils/upload-handler.utils'
import { requireRouteId } from '../utils/id-validator.utils'
import { ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { LogEvent } from '../constants/log-events'

const departments = new Hono<HonoContext>()

departments.use('/*', authMiddleware)
departments.use('/*', csrfProtection)

// Get all departments with optional pagination and filtering
departments.get('/', zValidator('query', listDepartmentsQuerySchema), async (c) => {
  const include = c.req.query('include') === 'true'
  const { page, limit, sort, order, search, status } = c.req.valid('query')

  const departmentList = await DepartmentService.getAll(include, { page, limit, sort, order }, { search, status })
  return successResponse(c, departmentList)
})

// Download import template
departments.get('/template', async (c) => {
  const workbook = await TemplateService.generateDepartmentTemplate()
  const buffer = await workbook.xlsx.writeBuffer()
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition', 'attachment; filename="department-import-template.xlsx"')
  return c.body(buffer)
})

// Get a single department by ID
departments.get('/:id', async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.DEPARTMENT_INVALID_ID)
  const include = c.req.query('include') === 'true'
  const department = await DepartmentService.getById(id, include)
  return successResponse(c, department)
})

// Create a new department
departments.post('/', requireAdmin, zValidator('json', createDepartmentSchema), async (c) => {
  const user = c.get('user')
  const { name } = c.req.valid('json')

  const department = await DepartmentService.create(name, user.username)
  c.get('logInfo')(LogEvent.DEPT_CREATED(name))
  return createdResponse(c, department)
})

// Update an existing department
departments.put('/:id', requireAdmin, zValidator('json', updateDepartmentSchema), async (c) => {
  const user = c.get('user')
  const id = requireRouteId(c.req.param('id'), CODES.DEPARTMENT_INVALID_ID)
  const validated = c.req.valid('json')

  const oldDepartment = await DepartmentService.getById(id)
  const department = await DepartmentService.update(id, validated, user.username)
  c.get('logInfo')(LogEvent.DEPT_UPDATED(department.name, (oldDepartment as DepartmentResponse).name))
  return successResponse(c, department)
})

// Delete a department
departments.delete('/:id', requireAdmin, async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.DEPARTMENT_INVALID_ID)
  const department = await DepartmentService.getById(id)
  await DepartmentService.delete(id)
  c.get('logInfo')(LogEvent.DEPT_DELETED((department as DepartmentResponse).name))
  return noContentResponse(c)
})

// Export to Excel
departments.get('/export/excel', zValidator('query', listDepartmentsQuerySchema), async (c) => {
  const { search, status } = c.req.valid('query')

  const departmentList = await DepartmentService.getAll(false, undefined, { search, status })
  const departmentData = Array.isArray(departmentList) ? departmentList : []
  const result = await ExportService.exportToExcel(departmentData as DepartmentResponse[], { columns: departmentExcelColumns })
  const filename = `Departments_Export_${exportTimestamp()}.xlsx`
  return sendExcelResponse(c, result, filename)
})

// Import from Excel
departments.post('/import', requireAdmin, async (c) => {
  const user = c.get('user')
  const file = await resolveUploadedFile(c)

  const fileValidation = ImportService.validateDepartmentFile(file.buffer)
  if (!fileValidation.valid) {
    throw new ValidationError(CODES.USER_INVALID_FILE_STRUCTURE, MSG.errors.import.invalidFileStructure, fileValidation.errors)
  }

  const result = await ImportService.importDepartments(file.buffer, user.username)
  c.get('logInfo')(LogEvent.DEPT_IMPORTED(result.success, result.failed))

  return successResponse(c, {
    imported: result.success,
    failed: result.failed,
    total: result.success + result.failed,
    errors: result.errors
  })
})

export default departments

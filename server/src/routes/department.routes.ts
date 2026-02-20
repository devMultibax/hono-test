import { Hono } from 'hono'
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
import { parseUpload, validateFile, type UploadedFile } from '../middleware/upload'
import { stream } from 'hono/streaming'
import { CODES } from '../constants/error-codes'

const departments = new Hono<HonoContext>()

departments.use('/*', authMiddleware)
departments.use('/*', csrfProtection)

// Get all departments with optional pagination and filtering
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
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: CODES.DEPARTMENT_INVALID_ID }, 400)
  }

  const include = c.req.query('include') === 'true'
  const department = await DepartmentService.getById(id, include)
  return successResponse(c, department)
})

// Create a new department
departments.post('/', requireAdmin, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const validated = createDepartmentSchema.parse(body)

  const department = await DepartmentService.create(validated.name, user.username)
  c.get('logInfo')(`Created department "${validated.name}"`)
  return createdResponse(c, department)
})

// Update an existing department
departments.put('/:id', requireAdmin, async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: CODES.DEPARTMENT_INVALID_ID }, 400)
  }

  const body = await c.req.json()
  const validated = updateDepartmentSchema.parse(body)

  const oldDepartment = await DepartmentService.getById(id)
  const department = await DepartmentService.update(id, validated, user.username)
  c.get('logInfo')(`Updated department "${oldDepartment.name}" to "${department.name}"`)
  return successResponse(c, department)
})

// Delete a department
departments.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: CODES.DEPARTMENT_INVALID_ID }, 400)
  }

  const department = await DepartmentService.getById(id)
  await DepartmentService.delete(id)
  c.get('logInfo')(`Deleted department "${department.name}"`)
  return noContentResponse(c)
})

departments.get('/export/excel', async (c) => {
  const queryParams = listDepartmentsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    status: c.req.query('status')
  })

  const filters = {
    search: queryParams.search,
    status: queryParams.status
  }

  const departmentList = await DepartmentService.getAll(false, undefined, filters)
  const departmentData = Array.isArray(departmentList) ? departmentList : []

  const result = await ExportService.exportToExcel(departmentData as DepartmentResponse[], {
    columns: departmentExcelColumns
  })

  const filename = `departments_${new Date().toISOString().split('T')[0]}.xlsx`

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

departments.post('/import', requireAdmin, async (c) => {
  const user = c.get('user')
  const file = await parseUpload(c)

  if (!file) {
    return c.json({ error: CODES.USER_NO_FILE_UPLOADED }, 400)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const fileValidation = ImportService.validateDepartmentFile(file.buffer)

  if (!fileValidation.valid) {
    return c.json({ error: CODES.USER_INVALID_FILE_STRUCTURE, details: fileValidation.errors }, 400)
  }

  const result = await ImportService.importDepartments(file.buffer, user.username)
  c.get('logInfo')(`Imported departments: ${result.success} success, ${result.failed} failed`)

  return c.json({
    success: result.success,
    failed: result.failed,
    total: result.success + result.failed,
    errors: result.errors
  }, 200)
})

export default departments

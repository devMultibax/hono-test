import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { DepartmentService } from '../services/department.service'
import { createDepartmentSchema, updateDepartmentSchema, listDepartmentsQuerySchema } from '../schemas/department'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext, DepartmentResponse } from '../types'
import { ExportService } from '../services/export.service'
import { stream } from 'hono/streaming'

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
  const departments = Array.isArray(departmentList) ? departmentList : []
  const totalCount = departments.length

  const result = await ExportService.exportDepartmentsToExcel(
    departments as DepartmentResponse[],
    totalCount
  )

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

departments.get('/export/pdf', async (c) => {
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
  const departments = Array.isArray(departmentList) ? departmentList : []

  const pdfStream = await ExportService.exportDepartmentsToPDF(departments as DepartmentResponse[])
  const filename = `departments_${new Date().toISOString().split('T')[0]}.pdf`

  return stream(c, async (stream) => {
    c.header('Content-Type', 'application/pdf')
    c.header('Content-Disposition', `attachment; filename="${filename}"`)

    pdfStream.on('data', (chunk) => {
      stream.write(chunk)
    })

    return new Promise((resolve, reject) => {
      pdfStream.on('end', () => {
        stream.close()
        resolve()
      })
      pdfStream.on('error', reject)
    })
  })
})

export default departments

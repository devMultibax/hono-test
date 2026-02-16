import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { SectionService } from '../services/section.service'
import { createSectionSchema, updateSectionSchema, listSectionsQuerySchema } from '../schemas/section'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext, SectionWithRelations } from '../types'
import { ExportService } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { sectionExcelColumns } from '../controllers/section.controller'
import { parseUpload, validateFile } from '../middleware/upload'
import { stream } from 'hono/streaming'

const sections = new Hono<HonoContext>()

sections.use('/*', authMiddleware)
sections.use('/*', csrfProtection)

// Get all sections with optional pagination and filtering
sections.get('/', async (c) => {
  const include = c.req.query('include') === 'true'
  const queryParams = listSectionsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
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
    status: queryParams.status
  }

  const sectionList = await SectionService.getAll(include, pagination, filters)
  return successResponse(c, sectionList)
})

// Get a single section by ID
sections.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  const include = c.req.query('include') === 'true'
  const section = await SectionService.getById(id, include)
  return successResponse(c, section)
})

// Create a new section
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

// Update an existing section
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

// Delete a section
sections.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  await SectionService.delete(id)
  return noContentResponse(c)
})

sections.get('/export/excel', async (c) => {
  const queryParams = listSectionsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
    status: c.req.query('status')
  })

  const filters = {
    search: queryParams.search,
    departmentId: queryParams.departmentId,
    status: queryParams.status
  }

  const sectionList = await SectionService.getAll(true, undefined, filters)
  const sectionData = Array.isArray(sectionList) ? sectionList : []

  const result = await ExportService.exportToExcel(sectionData as SectionWithRelations[], {
    columns: sectionExcelColumns
  })

  const filename = `sections_${new Date().toISOString().split('T')[0]}.xlsx`

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

sections.post('/import', requireAdmin, async (c) => {
  const user = c.get('user')
  const file = await parseUpload(c)

  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const fileValidation = ImportService.validateSectionFile(file.buffer)

  if (!fileValidation.valid) {
    return c.json({ error: 'Invalid file structure', details: fileValidation.errors }, 400)
  }

  const result = await ImportService.importSections(file.buffer, user.username)

  return c.json({
    message: 'Import completed',
    result: {
      success: result.success,
      failed: result.failed,
      errors: result.errors
    }
  }, 200)
})

export default sections

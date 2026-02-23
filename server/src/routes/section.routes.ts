import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { SectionService } from '../services/section.service'
import { createSectionSchema, updateSectionSchema, listSectionsQuerySchema } from '../schemas/section'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext, SectionWithRelations } from '../types'
import { ExportService, sectionExcelColumns } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { TemplateService } from '../services/template.service'
import { sendExcelResponse } from '../utils/excel-response.utils'
import { resolveUploadedFile } from '../utils/upload-handler.utils'
import { requireRouteId } from '../utils/id-validator.utils'
import { ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'

const sections = new Hono<HonoContext>()

sections.use('/*', authMiddleware)
sections.use('/*', csrfProtection)

// Get all sections with optional pagination and filtering
sections.get('/', zValidator('query', listSectionsQuerySchema), async (c) => {
  const include = c.req.query('include') === 'true'
  const { page, limit, sort, order, search, departmentId, status } = c.req.valid('query')

  const sectionList = await SectionService.getAll(include, { page, limit, sort, order }, { search, departmentId, status })
  return successResponse(c, sectionList)
})

// Download import template
sections.get('/template', async (c) => {
  const workbook = await TemplateService.generateSectionTemplate()
  const buffer = await workbook.xlsx.writeBuffer()
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition', 'attachment; filename="section-import-template.xlsx"')
  return c.body(buffer)
})

// Get a single section by ID
sections.get('/:id', async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.SECTION_INVALID_ID)
  const include = c.req.query('include') === 'true'
  const section = await SectionService.getById(id, include)
  return successResponse(c, section)
})

// Create a new section
sections.post('/', requireAdmin, zValidator('json', createSectionSchema), async (c) => {
  const user = c.get('user')
  const { departmentId, name } = c.req.valid('json')

  const section = await SectionService.create(departmentId, name, user.username)
  c.get('logInfo')(`Created section "${name}"`)
  return createdResponse(c, section)
})

// Update an existing section
sections.put('/:id', requireAdmin, zValidator('json', updateSectionSchema), async (c) => {
  const user = c.get('user')
  const id = requireRouteId(c.req.param('id'), CODES.SECTION_INVALID_ID)
  const validated = c.req.valid('json')

  const oldSection = await SectionService.getById(id, true) as SectionWithRelations
  const section = await SectionService.update(id, validated, user.username)
  c.get('logInfo')(`Updated section "${oldSection.name}" to "${section.name}" in department "${oldSection.department?.name ?? '-'}"`)
  return successResponse(c, section)
})

// Delete a section
sections.delete('/:id', requireAdmin, async (c) => {
  const id = requireRouteId(c.req.param('id'), CODES.SECTION_INVALID_ID)
  const oldSection = await SectionService.getById(id, true) as SectionWithRelations
  await SectionService.delete(id)
  c.get('logInfo')(`Deleted section "${oldSection.name}" in department "${oldSection.department?.name ?? '-'}"`)
  return noContentResponse(c)
})

// Export to Excel
sections.get('/export/excel', zValidator('query', listSectionsQuerySchema), async (c) => {
  const { search, departmentId, status } = c.req.valid('query')

  const sectionList = await SectionService.getAll(true, undefined, { search, departmentId, status })
  const sectionData = Array.isArray(sectionList) ? sectionList : []
  const result = await ExportService.exportToExcel(sectionData as SectionWithRelations[], { columns: sectionExcelColumns })
  const filename = `sections_${new Date().toISOString().split('T')[0]}.xlsx`
  return sendExcelResponse(c, result, filename)
})

// Import from Excel
sections.post('/import', requireAdmin, async (c) => {
  const user = c.get('user')
  const file = await resolveUploadedFile(c)

  const fileValidation = ImportService.validateSectionFile(file.buffer)
  if (!fileValidation.valid) {
    throw new ValidationError(CODES.USER_INVALID_FILE_STRUCTURE, fileValidation.errors)
  }

  const result = await ImportService.importSections(file.buffer, user.username)
  c.get('logInfo')(`Imported sections: ${result.success} success, ${result.failed} failed`)

  return successResponse(c, {
    imported: result.success,
    failed: result.failed,
    total: result.success + result.failed,
    errors: result.errors
  })
})

export default sections

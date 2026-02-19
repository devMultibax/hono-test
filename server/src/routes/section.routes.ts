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
import ExcelJS from 'exceljs'
import { CODES } from '../constants/error-codes'

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

// Download import template
sections.get('/template', async (c) => {
  const workbook = new ExcelJS.Workbook()

  // Sheet 1: Data template
  const ws = workbook.addWorksheet('Section Import')

  const templateColumns = [
    { header: 'Department', key: 'department', width: 30, required: true, note: 'ชื่อฝ่าย (ต้องตรงกับชื่อฝ่ายที่มีในระบบ)\nตัวอย่าง: ฝ่ายบริหาร' },
    { header: 'Name', key: 'name', width: 30, required: true, note: 'ชื่อหน่วยงาน (ไม่เกิน 100 ตัวอักษร)\nตัวอย่าง: แผนกบุคคล' },
  ]

  ws.columns = templateColumns.map(({ header, key, width }) => ({ header, key, width }))

  // Style header row
  const headerRow = ws.getRow(1)
  headerRow.height = 28
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

  templateColumns.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1)
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: col.required ? 'FFDC3545' : 'FF6C757D' }
    }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
    cell.note = {
      texts: [{ text: col.note + (col.required ? '\n\n⚠️ จำเป็นต้องกรอก' : '\n\nไม่จำเป็นต้องกรอก') }],
    }
  })

  // Example data row
  ws.addRow({
    department: 'ฝ่ายบริหาร',
    name: 'แผนกบุคคล',
  })
  const exampleRow = ws.getRow(2)
  exampleRow.font = { color: { argb: 'FF6C757D' }, italic: true }
  exampleRow.getCell(1).note = {
    texts: [{ text: '⚠️ นี่คือแถวตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง\n\nคลิกที่ตัวเลขแถว (2) ด้านซ้ายแล้วกด Delete' }],
  }

  ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }]

  // Sheet 2: Instructions
  const instrSheet = workbook.addWorksheet('คำอธิบาย')
  instrSheet.columns = [
    { header: 'คอลัมน์', key: 'field', width: 20 },
    { header: 'จำเป็น', key: 'required', width: 10 },
    { header: 'คำอธิบาย', key: 'description', width: 35 },
    { header: 'ตัวอย่าง', key: 'example', width: 25 },
    { header: 'เงื่อนไข', key: 'rules', width: 50 },
  ]

  const instrHeader = instrSheet.getRow(1)
  instrHeader.height = 28
  instrHeader.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
  instrHeader.alignment = { vertical: 'middle', horizontal: 'center' }
  instrHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  })

  const instructions = [
    { field: 'Department', required: 'ใช่', description: 'ชื่อฝ่าย', example: 'ฝ่ายบริหาร', rules: 'ต้องตรงกับชื่อฝ่ายที่มีอยู่ในระบบ (ตัวอักษรต้องตรงกันทุกตัว)' },
    { field: 'Name', required: 'ใช่', description: 'ชื่อหน่วยงาน', example: 'แผนกบุคคล', rules: 'ไม่เกิน 100 ตัวอักษร' },
  ]

  instructions.forEach((instr) => {
    const row = instrSheet.addRow(instr)
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
      }
    })
    if (instr.required === 'ใช่') {
      row.getCell(2).font = { color: { argb: 'FFDC3545' }, bold: true }
    } else {
      row.getCell(2).font = { color: { argb: 'FF198754' } }
    }
  })

  instrSheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }]

  // Add legend section
  instrSheet.addRow([])
  const legendTitleRow = instrSheet.addRow(['คำอธิบายสัญลักษณ์'])
  legendTitleRow.getCell(1).font = { bold: true, size: 12 }
  legendTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9ECEF' } }

  const legend1 = instrSheet.addRow(['⬤ คอลัมน์สีแดง', 'จำเป็นต้องกรอก (Required)'])
  legend1.getCell(1).font = { color: { argb: 'FFDC3545' }, bold: true }
  const legend2 = instrSheet.addRow(['⬤ คอลัมน์สีเทา', 'ไม่จำเป็นต้องกรอก (Optional)'])
  legend2.getCell(1).font = { color: { argb: 'FF6C757D' }, bold: true }

  instrSheet.addRow([])
  const noteTitleRow = instrSheet.addRow(['หมายเหตุสำคัญ'])
  noteTitleRow.getCell(1).font = { bold: true, size: 12 }
  noteTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9ECEF' } }

  instrSheet.addRow(['⚠️ แถวตัวอย่าง', 'แถวที่ 2 ใน sheet "Section Import" เป็นตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง'])
  instrSheet.addRow(['🔗 ชื่อฝ่าย', 'ต้องระบุชื่อฝ่ายที่ตรงกับชื่อในระบบ (ดูได้จากหน้าจัดการฝ่าย)'])
  instrSheet.addRow(['💡 วิธีดูคำอธิบาย', 'วางเมาส์บนหัวคอลัมน์ใน sheet "Section Import" เพื่อดูคำอธิบายเพิ่มเติม'])

  const buffer = await workbook.xlsx.writeBuffer()
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition', 'attachment; filename="section-import-template.xlsx"')
  return c.body(buffer)
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
  c.get('logInfo')(`Created section "${validated.name}"`)
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

  const oldSection = await SectionService.getById(id, true) as SectionWithRelations
  const section = await SectionService.update(id, validated, user.username)
  c.get('logInfo')(`Updated section "${oldSection.name}" to "${section.name}" in department "${oldSection.department?.name ?? '-'}"`)
  return successResponse(c, section)
})

// Delete a section
sections.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  const oldSection = await SectionService.getById(id, true) as SectionWithRelations
  await SectionService.delete(id)
  c.get('logInfo')(`Deleted section "${oldSection.name}" in department "${oldSection.department?.name ?? '-'}"`)
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
    return c.json({ error: CODES.USER_NO_FILE_UPLOADED }, 400)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const fileValidation = ImportService.validateSectionFile(file.buffer)

  if (!fileValidation.valid) {
    return c.json({ error: CODES.USER_INVALID_FILE_STRUCTURE, details: fileValidation.errors }, 400)
  }

  const result = await ImportService.importSections(file.buffer, user.username)
  c.get('logInfo')(`Imported sections: ${result.success} success, ${result.failed} failed`)

  return c.json({
    success: result.success,
    failed: result.failed,
    total: result.success + result.failed,
    errors: result.errors
  }, 200)
})

export default sections

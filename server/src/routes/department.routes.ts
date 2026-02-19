import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { DepartmentService } from '../services/department.service'
import { createDepartmentSchema, updateDepartmentSchema, listDepartmentsQuerySchema } from '../schemas/department'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext, DepartmentResponse } from '../types'
import { ExportService } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { departmentExcelColumns } from '../controllers/department.controller'
import { parseUpload, validateFile, type UploadedFile } from '../middleware/upload'
import { stream } from 'hono/streaming'
import { CODES } from '../constants/error-codes'
import ExcelJS from 'exceljs'

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
  const workbook = new ExcelJS.Workbook()

  // Sheet 1: Data template
  const ws = workbook.addWorksheet('Department Import')

  const templateColumns = [
    { header: 'Name', key: 'name', width: 30, required: true, note: 'ชื่อฝ่าย (ไม่เกิน 100 ตัวอักษร)\nตัวอย่าง: ฝ่ายบริหาร' },
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
    name: 'ฝ่ายบริหาร',
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
    { field: 'Name', required: 'ใช่', description: 'ชื่อฝ่าย', example: 'ฝ่ายบริหาร', rules: 'ไม่เกิน 100 ตัวอักษร, ต้องไม่ซ้ำกับชื่อฝ่ายที่มีอยู่' },
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

  instrSheet.addRow(['⚠️ แถวตัวอย่าง', 'แถวที่ 2 ใน sheet "Department Import" เป็นตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง'])
  instrSheet.addRow(['💡 วิธีดูคำอธิบาย', 'วางเมาส์บนหัวคอลัมน์ใน sheet "Department Import" เพื่อดูคำอธิบายเพิ่มเติม'])

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

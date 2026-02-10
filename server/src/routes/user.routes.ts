import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin, requireUser } from '../middleware/permission'
import { UserService } from '../services/user.service'
import { registerSchema, updateUserSchema, listUsersQuerySchema } from '../schemas/user'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import { Role, type HonoContext, type UserWithRelations } from '../types'
import { ExportService } from '../services/export.service'
import { ImportService } from '../services/import.service'
import { userExcelColumns } from '../controllers/user.controller'
import { parseUpload, validateFile } from '../middleware/upload'
import { stream } from 'hono/streaming'
import { MESSAGES } from '../constants/message'
import ExcelJS from 'exceljs'

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
  const workbook = new ExcelJS.Workbook()

  // Sheet 1: Data template
  const ws = workbook.addWorksheet('User Import')

  const templateColumns = [
    { header: 'Username', key: 'username', width: 20, required: true, note: 'รหัสพนักงาน 6 หลัก (ตัวเลขและตัวอักษร)\nตัวอย่าง: 100001' },
    { header: 'First Name', key: 'firstName', width: 20, required: true, note: 'ชื่อจริง (ไม่เกิน 100 ตัวอักษร)' },
    { header: 'Last Name', key: 'lastName', width: 20, required: true, note: 'นามสกุล (ไม่เกิน 100 ตัวอักษร)' },
    { header: 'Department ID', key: 'departmentId', width: 18, required: true, note: 'รหัสฝ่าย (ตัวเลข)\nดูรหัสได้จากหน้าจัดการฝ่าย' },
    { header: 'Section ID', key: 'sectionId', width: 15, required: false, note: 'รหัสหน่วยงาน (ตัวเลข)\nดูรหัสได้จากหน้าจัดการหน่วยงาน' },
    { header: 'Email', key: 'email', width: 30, required: false, note: 'อีเมล (รูปแบบ: example@email.com)' },
    { header: 'Tel', key: 'tel', width: 18, required: false, note: 'เบอร์โทร 10 หลัก (ตัวเลขเท่านั้น)\nตัวอย่าง: 0812345678' },
    { header: 'Role', key: 'role', width: 12, required: false, note: 'สิทธิ์: USER หรือ ADMIN\n(ค่าเริ่มต้น: USER)' },
  ]

  ws.columns = templateColumns.map(({ header, key, width }) => ({ header, key, width }))

  // Force Username and Tel columns to text format to prevent Excel from converting to number
  ws.getColumn('username').numFmt = '@'
  ws.getColumn('tel').numFmt = '@'

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

  // Example data row (with comment on first cell)
  ws.addRow({
    username: '100001',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    departmentId: 1,
    sectionId: 1,
    email: 'somchai@email.com',
    tel: '0812345678',
    role: 'USER',
  })
  const exampleRow = ws.getRow(2)
  exampleRow.font = { color: { argb: 'FF6C757D' }, italic: true }
  // Force username to be text format to prevent Excel from converting to number
  exampleRow.getCell(1).numFmt = '@'
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
    { field: 'Username', required: 'ใช่', description: 'รหัสพนักงาน', example: '100001', rules: 'ต้องมี 6 ตัวอักษร, ตัวเลขและตัวอักษรภาษาอังกฤษเท่านั้น' },
    { field: 'First Name', required: 'ใช่', description: 'ชื่อจริง', example: 'สมชาย', rules: 'ไม่เกิน 100 ตัวอักษร' },
    { field: 'Last Name', required: 'ใช่', description: 'นามสกุล', example: 'ใจดี', rules: 'ไม่เกิน 100 ตัวอักษร' },
    { field: 'Department ID', required: 'ใช่', description: 'รหัสฝ่าย', example: '1', rules: 'ต้องเป็นตัวเลขที่มากกว่า 0, ดูรหัสได้จากหน้าจัดการฝ่าย' },
    { field: 'Section ID', required: 'ไม่', description: 'รหัสหน่วยงาน', example: '1', rules: 'ต้องเป็นตัวเลขที่มากกว่า 0 (ถ้ากรอก), ดูรหัสได้จากหน้าจัดการหน่วยงาน' },
    { field: 'Email', required: 'ไม่', description: 'อีเมล', example: 'somchai@email.com', rules: 'ต้องเป็นรูปแบบอีเมลที่ถูกต้อง (ถ้ากรอก)' },
    { field: 'Tel', required: 'ไม่', description: 'เบอร์โทรศัพท์', example: '0812345678', rules: 'ต้องเป็นตัวเลข 10 หลักเท่านั้น (ถ้ากรอก)' },
    { field: 'Role', required: 'ไม่', description: 'สิทธิ์การใช้งาน', example: 'USER', rules: 'ค่าที่รองรับ: USER, ADMIN (ค่าเริ่มต้น: USER)' },
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

  // Add legend section at the bottom
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

  instrSheet.addRow(['⚠️ แถวตัวอย่าง', 'แถวที่ 2 ใน sheet "User Import" เป็นตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง'])
  instrSheet.addRow(['🔑 รหัสผ่าน', 'รหัสผ่านจะถูกสร้างอัตโนมัติโดยระบบ'])
  instrSheet.addRow(['💡 วิธีดูคำอธิบาย', 'วางเมาส์บนหัวคอลัมน์ใน sheet "User Import" เพื่อดูคำอธิบายเพิ่มเติม'])

  const buffer = await workbook.xlsx.writeBuffer()
  c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  c.header('Content-Disposition', 'attachment; filename="user-import-template.xlsx"')
  return c.body(buffer)
})

// Get a single user by ID
users.get('/:id', requireUser, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: MESSAGES.USER.INVALID_ID }, 400)
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
    return c.json({ error: MESSAGES.USER.INVALID_ID }, 400)
  }

  const body = await c.req.json()
  const validated = updateUserSchema.parse(body)

  const user = await UserService.update(id, validated, currentUser.username)
  return successResponse(c, user)
})

// Delete a user
users.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: MESSAGES.USER.INVALID_ID }, 400)
  }

  await UserService.delete(id)
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
    return c.json({ error: MESSAGES.USER.INVALID_ID }, 400)
  }

  const result = await UserService.resetPassword(id, currentUser.username)
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
    return c.json({ error: MESSAGES.USER.NO_FILE_UPLOADED }, 400)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  const fileValidation = ImportService.validateUserFile(file.buffer)

  if (!fileValidation.valid) {
    return c.json({ error: MESSAGES.USER.INVALID_FILE_STRUCTURE, details: fileValidation.errors }, 400)
  }

  const result = await ImportService.importUsers(file.buffer, user.username)

  return c.json({
    success: result.success,
    failed: result.failed,
    total: result.success + result.failed,
    errors: result.errors.map(e => `Row ${e.row}: ${e.error}`)
  }, 200)
})

export default users

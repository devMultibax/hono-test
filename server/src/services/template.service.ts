import ExcelJS from 'exceljs'

// ─── Internal Types ───────────────────────────────────────────────────────────

interface TemplateColumn {
  header: string
  key: string
  width: number
  required: boolean
  note: string
  /** Force cell to text format to prevent Excel from auto-converting values (e.g. numeric IDs) */
  textFormat?: boolean
}

interface TemplateInstruction {
  field: string
  required: 'ใช่' | 'ไม่'
  description: string
  example: string
  rules: string
}

interface DataSheetOptions {
  worksheetName: string
  columns: TemplateColumn[]
  exampleRow: Record<string, unknown>
}

interface InstructionSheetOptions {
  /** Sheet name of the import template (used in ⚠️ example-row note) */
  importSheetName: string
  instructions: TemplateInstruction[]
  /** Additional rows appended to the หมายเหตุสำคัญ section */
  additionalNotes?: [string, string][]
}

// ─── TemplateService ──────────────────────────────────────────────────────────

/**
 * Generates styled Excel import template workbooks.
 *
 * Extracted from `user.routes.ts`, `department.routes.ts`, and `section.routes.ts`
 * to eliminate ~150 lines of duplication per route.
 */
export class TemplateService {
  // ── Private Helpers ─────────────────────────────────────────────────────────

  /** Builds the data entry worksheet (Sheet 1) */
  private static buildDataSheet(workbook: ExcelJS.Workbook, options: DataSheetOptions): void {
    const { worksheetName, columns, exampleRow } = options

    const ws = workbook.addWorksheet(worksheetName)
    ws.columns = columns.map(({ header, key, width }) => ({ header, key, width }))

    // Force text format for columns that should not be auto-converted by Excel
    columns.forEach((col) => {
      if (col.textFormat) {
        ws.getColumn(col.key).numFmt = '@'
      }
    })

    // Style header row
    const headerRow = ws.getRow(1)
    headerRow.height = 28
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

    columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1)
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: col.required ? 'FFDC3545' : 'FF6C757D' },
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.note = {
        texts: [
          {
            text:
              col.note +
              (col.required ? '\n\n⚠️ จำเป็นต้องกรอก' : '\n\nไม่จำเป็นต้องกรอก'),
          },
        ],
      }
    })

    // Example data row
    ws.addRow(exampleRow)
    const exampleDataRow = ws.getRow(2)
    exampleDataRow.font = { color: { argb: 'FF6C757D' }, italic: true }

    // Force text format for textFormat columns on the example row too
    columns.forEach((col, idx) => {
      if (col.textFormat) {
        exampleDataRow.getCell(idx + 1).numFmt = '@'
      }
    })

    exampleDataRow.getCell(1).note = {
      texts: [
        {
          text: '⚠️ นี่คือแถวตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง\n\nคลิกที่ตัวเลขแถว (2) ด้านซ้ายแล้วกด Delete',
        },
      ],
    }

    ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }]
  }

  /** Builds the instruction worksheet (Sheet 2 — "คำอธิบาย") */
  private static buildInstructionSheet(
    workbook: ExcelJS.Workbook,
    options: InstructionSheetOptions
  ): void {
    const { importSheetName, instructions, additionalNotes = [] } = options

    const instrSheet = workbook.addWorksheet('คำอธิบาย')
    instrSheet.columns = [
      { header: 'คอลัมน์', key: 'field', width: 20 },
      { header: 'จำเป็น', key: 'required', width: 10 },
      { header: 'คำอธิบาย', key: 'description', width: 35 },
      { header: 'ตัวอย่าง', key: 'example', width: 25 },
      { header: 'เงื่อนไข', key: 'rules', width: 50 },
    ]

    // Style instruction header row
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
        right: { style: 'thin' },
      }
    })

    // Instruction data rows
    instructions.forEach((instr) => {
      const row = instrSheet.addRow(instr)
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        }
      })
      if (instr.required === 'ใช่') {
        row.getCell(2).font = { color: { argb: 'FFDC3545' }, bold: true }
      } else {
        row.getCell(2).font = { color: { argb: 'FF198754' } }
      }
    })

    instrSheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }]

    // Legend section
    instrSheet.addRow([])
    const legendTitleRow = instrSheet.addRow(['คำอธิบายสัญลักษณ์'])
    legendTitleRow.getCell(1).font = { bold: true, size: 12 }
    legendTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' },
    }

    const legend1 = instrSheet.addRow(['⬤ คอลัมน์สีแดง', 'จำเป็นต้องกรอก (Required)'])
    legend1.getCell(1).font = { color: { argb: 'FFDC3545' }, bold: true }
    const legend2 = instrSheet.addRow(['⬤ คอลัมน์สีเทา', 'ไม่จำเป็นต้องกรอก (Optional)'])
    legend2.getCell(1).font = { color: { argb: 'FF6C757D' }, bold: true }

    // หมายเหตุสำคัญ section
    instrSheet.addRow([])
    const noteTitleRow = instrSheet.addRow(['หมายเหตุสำคัญ'])
    noteTitleRow.getCell(1).font = { bold: true, size: 12 }
    noteTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' },
    }

    instrSheet.addRow([
      '⚠️ แถวตัวอย่าง',
      `แถวที่ 2 ใน sheet "${importSheetName}" เป็นตัวอย่าง กรุณาลบออกก่อนนำเข้าข้อมูลจริง`,
    ])

    additionalNotes.forEach((note) => instrSheet.addRow(note))

    instrSheet.addRow([
      '💡 วิธีดูคำอธิบาย',
      `วางเมาส์บนหัวคอลัมน์ใน sheet "${importSheetName}" เพื่อดูคำอธิบายเพิ่มเติม`,
    ])
  }

  // ── Public Methods ───────────────────────────────────────────────────────────

  /** Generates the User import template workbook */
  static async generateUserTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()

    this.buildDataSheet(workbook, {
      worksheetName: 'User Import',
      columns: [
        {
          header: 'Username',
          key: 'username',
          width: 20,
          required: true,
          note: 'รหัสพนักงาน 6 หลัก (ตัวเลขและตัวอักษร)\nตัวอย่าง: 100001',
          textFormat: true,
        },
        {
          header: 'First Name',
          key: 'firstName',
          width: 20,
          required: true,
          note: 'ชื่อจริง (ไม่เกิน 100 ตัวอักษร)',
        },
        {
          header: 'Last Name',
          key: 'lastName',
          width: 20,
          required: true,
          note: 'นามสกุล (ไม่เกิน 100 ตัวอักษร)',
        },
        {
          header: 'Department ID',
          key: 'departmentId',
          width: 18,
          required: true,
          note: 'รหัสฝ่าย (ตัวเลข)\nดูรหัสได้จากหน้าจัดการฝ่าย',
        },
        {
          header: 'Section ID',
          key: 'sectionId',
          width: 15,
          required: false,
          note: 'รหัสหน่วยงาน (ตัวเลข)\nดูรหัสได้จากหน้าจัดการหน่วยงาน',
        },
        {
          header: 'Email',
          key: 'email',
          width: 30,
          required: false,
          note: 'อีเมล (รูปแบบ: example@email.com)',
        },
        {
          header: 'Tel',
          key: 'tel',
          width: 18,
          required: false,
          note: 'เบอร์โทร 10 หลัก (ตัวเลขเท่านั้น)\nตัวอย่าง: 0812345678',
          textFormat: true,
        },
        {
          header: 'Role',
          key: 'role',
          width: 12,
          required: false,
          note: 'สิทธิ์: USER หรือ ADMIN\n(ค่าเริ่มต้น: USER)',
        },
      ],
      exampleRow: {
        username: '100001',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        departmentId: 1,
        sectionId: 1,
        email: 'somchai@email.com',
        tel: '0812345678',
        role: 'USER',
      },
    })

    this.buildInstructionSheet(workbook, {
      importSheetName: 'User Import',
      instructions: [
        {
          field: 'Username',
          required: 'ใช่',
          description: 'รหัสพนักงาน',
          example: '100001',
          rules: 'ต้องมี 6 ตัวอักษร, ตัวเลขและตัวอักษรภาษาอังกฤษเท่านั้น',
        },
        {
          field: 'First Name',
          required: 'ใช่',
          description: 'ชื่อจริง',
          example: 'สมชาย',
          rules: 'ไม่เกิน 100 ตัวอักษร',
        },
        {
          field: 'Last Name',
          required: 'ใช่',
          description: 'นามสกุล',
          example: 'ใจดี',
          rules: 'ไม่เกิน 100 ตัวอักษร',
        },
        {
          field: 'Department ID',
          required: 'ใช่',
          description: 'รหัสฝ่าย',
          example: '1',
          rules: 'ต้องเป็นตัวเลขที่มากกว่า 0, ดูรหัสได้จากหน้าจัดการฝ่าย',
        },
        {
          field: 'Section ID',
          required: 'ไม่',
          description: 'รหัสหน่วยงาน',
          example: '1',
          rules: 'ต้องเป็นตัวเลขที่มากกว่า 0 (ถ้ากรอก), ดูรหัสได้จากหน้าจัดการหน่วยงาน',
        },
        {
          field: 'Email',
          required: 'ไม่',
          description: 'อีเมล',
          example: 'somchai@email.com',
          rules: 'ต้องเป็นรูปแบบอีเมลที่ถูกต้อง (ถ้ากรอก)',
        },
        {
          field: 'Tel',
          required: 'ไม่',
          description: 'เบอร์โทรศัพท์',
          example: '0812345678',
          rules: 'ต้องเป็นตัวเลข 10 หลักเท่านั้น (ถ้ากรอก)',
        },
        {
          field: 'Role',
          required: 'ไม่',
          description: 'สิทธิ์การใช้งาน',
          example: 'USER',
          rules: 'ค่าที่รองรับ: USER, ADMIN (ค่าเริ่มต้น: USER)',
        },
      ],
      additionalNotes: [['🔑 รหัสผ่าน', 'รหัสผ่านจะถูกสร้างอัตโนมัติโดยระบบ']],
    })

    return workbook
  }

  /** Generates the Department import template workbook */
  static async generateDepartmentTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()

    this.buildDataSheet(workbook, {
      worksheetName: 'Department Import',
      columns: [
        {
          header: 'Name',
          key: 'name',
          width: 30,
          required: true,
          note: 'ชื่อฝ่าย (ไม่เกิน 100 ตัวอักษร)\nตัวอย่าง: ฝ่ายบริหาร',
        },
      ],
      exampleRow: {
        name: 'ฝ่ายบริหาร',
      },
    })

    this.buildInstructionSheet(workbook, {
      importSheetName: 'Department Import',
      instructions: [
        {
          field: 'Name',
          required: 'ใช่',
          description: 'ชื่อฝ่าย',
          example: 'ฝ่ายบริหาร',
          rules: 'ไม่เกิน 100 ตัวอักษร, ต้องไม่ซ้ำกับชื่อฝ่ายที่มีอยู่',
        },
      ],
    })

    return workbook
  }

  /** Generates the Section import template workbook */
  static async generateSectionTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()

    this.buildDataSheet(workbook, {
      worksheetName: 'Section Import',
      columns: [
        {
          header: 'Department',
          key: 'department',
          width: 30,
          required: true,
          note: 'ชื่อฝ่าย (ต้องตรงกับชื่อฝ่ายที่มีในระบบ)\nตัวอย่าง: ฝ่ายบริหาร',
        },
        {
          header: 'Name',
          key: 'name',
          width: 30,
          required: true,
          note: 'ชื่อหน่วยงาน (ไม่เกิน 100 ตัวอักษร)\nตัวอย่าง: แผนกบุคคล',
        },
      ],
      exampleRow: {
        department: 'ฝ่ายบริหาร',
        name: 'แผนกบุคคล',
      },
    })

    this.buildInstructionSheet(workbook, {
      importSheetName: 'Section Import',
      instructions: [
        {
          field: 'Department',
          required: 'ใช่',
          description: 'ชื่อฝ่าย',
          example: 'ฝ่ายบริหาร',
          rules: 'ต้องตรงกับชื่อฝ่ายที่มีอยู่ในระบบ (ตัวอักษรต้องตรงกันทุกตัว)',
        },
        {
          field: 'Name',
          required: 'ใช่',
          description: 'ชื่อหน่วยงาน',
          example: 'แผนกบุคคล',
          rules: 'ไม่เกิน 100 ตัวอักษร',
        },
      ],
      additionalNotes: [
        ['🔗 ชื่อฝ่าย', 'ต้องระบุชื่อฝ่ายที่ตรงกับชื่อในระบบ (ดูได้จากหน้าจัดการฝ่าย)'],
      ],
    })

    return workbook
  }
}

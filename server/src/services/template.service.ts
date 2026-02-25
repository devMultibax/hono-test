import ExcelJS from 'exceljs'
import { MSG } from '../constants/messages'

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
  required: string
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
              (col.required ? MSG.template.cellNotes.required : MSG.template.cellNotes.optional),
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
      texts: [{ text: MSG.template.cellNotes.exampleRow }],
    }

    ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }]
  }

  /** Builds the instruction worksheet (Sheet 2 — "คำอธิบาย") */
  private static buildInstructionSheet(
    workbook: ExcelJS.Workbook,
    options: InstructionSheetOptions
  ): void {
    const { importSheetName, instructions, additionalNotes = [] } = options

    const instrSheet = workbook.addWorksheet(MSG.template.worksheetName)
    instrSheet.columns = [
      { header: MSG.template.headers.column, key: 'field', width: 20 },
      { header: MSG.template.headers.required, key: 'required', width: 10 },
      { header: MSG.template.headers.description, key: 'description', width: 35 },
      { header: MSG.template.headers.example, key: 'example', width: 25 },
      { header: MSG.template.headers.rules, key: 'rules', width: 50 },
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
      if (instr.required === MSG.template.required.yes) {
        row.getCell(2).font = { color: { argb: 'FFDC3545' }, bold: true }
      } else {
        row.getCell(2).font = { color: { argb: 'FF198754' } }
      }
    })

    instrSheet.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }]

    // Legend section
    instrSheet.addRow([])
    const legendTitleRow = instrSheet.addRow([MSG.template.legend.title])
    legendTitleRow.getCell(1).font = { bold: true, size: 12 }
    legendTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' },
    }

    const legend1 = instrSheet.addRow([MSG.template.legend.requiredPrefix, MSG.template.legend.requiredLabel])
    legend1.getCell(1).font = { color: { argb: 'FFDC3545' }, bold: true }
    const legend2 = instrSheet.addRow([MSG.template.legend.optionalPrefix, MSG.template.legend.optionalLabel])
    legend2.getCell(1).font = { color: { argb: 'FF6C757D' }, bold: true }

    // หมายเหตุสำคัญ section
    instrSheet.addRow([])
    const noteTitleRow = instrSheet.addRow([MSG.template.notes.title])
    noteTitleRow.getCell(1).font = { bold: true, size: 12 }
    noteTitleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' },
    }

    instrSheet.addRow([
      MSG.template.notes.exampleRowPrefix,
      MSG.template.notes.exampleRowText(importSheetName),
    ])

    additionalNotes.forEach((note) => instrSheet.addRow(note))

    instrSheet.addRow([
      MSG.template.notes.tipPrefix,
      MSG.template.notes.tipText(importSheetName),
    ])
  }

  // ── Public Methods ───────────────────────────────────────────────────────────

  /** Generates the User import template workbook */
  static async generateUserTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()

    this.buildDataSheet(workbook, {
      worksheetName: 'Data',
      columns: [
        {
          header: 'Username',
          key: 'username',
          width: 20,
          required: true,
          note: MSG.template.user.columns.username,
          textFormat: true,
        },
        {
          header: 'First_Name',
          key: 'firstName',
          width: 20,
          required: true,
          note: MSG.template.user.columns.firstName,
        },
        {
          header: 'Last_Name',
          key: 'lastName',
          width: 20,
          required: true,
          note: MSG.template.user.columns.lastName,
        },
        {
          header: 'Department_ID',
          key: 'departmentId',
          width: 18,
          required: true,
          note: MSG.template.user.columns.departmentId,
        },
        {
          header: 'Section_ID',
          key: 'sectionId',
          width: 15,
          required: false,
          note: MSG.template.user.columns.sectionId,
        },
        {
          header: 'Email',
          key: 'email',
          width: 30,
          required: false,
          note: MSG.template.user.columns.email,
        },
        {
          header: 'Tel',
          key: 'tel',
          width: 18,
          required: false,
          note: MSG.template.user.columns.tel,
          textFormat: true,
        },
        {
          header: 'Role',
          key: 'role',
          width: 12,
          required: false,
          note: MSG.template.user.columns.role,
        },
      ],
      exampleRow: {
        username: '100001',
        firstName: MSG.template.user.exampleRow.firstName,
        lastName: MSG.template.user.exampleRow.lastName,
        departmentId: 1,
        sectionId: 1,
        email: 'somchai@email.com',
        tel: '0812345678',
        role: 'USER',
      },
    })

    this.buildInstructionSheet(workbook, {
      importSheetName: 'Data',
      instructions: [
        {
          field: 'Username',
          required: MSG.template.required.yes,
          description: MSG.template.user.instructions.username.description,
          example: '100001',
          rules: MSG.template.user.instructions.username.rules,
        },
        {
          field: 'First_Name',
          required: MSG.template.required.yes,
          description: MSG.template.user.instructions.firstName.description,
          example: MSG.template.user.exampleRow.firstName,
          rules: MSG.template.user.instructions.firstName.rules,
        },
        {
          field: 'Last_Name',
          required: MSG.template.required.yes,
          description: MSG.template.user.instructions.lastName.description,
          example: MSG.template.user.exampleRow.lastName,
          rules: MSG.template.user.instructions.lastName.rules,
        },
        {
          field: 'Department_ID',
          required: MSG.template.required.yes,
          description: MSG.template.user.instructions.departmentId.description,
          example: '1',
          rules: MSG.template.user.instructions.departmentId.rules,
        },
        {
          field: 'Section_ID',
          required: MSG.template.required.no,
          description: MSG.template.user.instructions.sectionId.description,
          example: '1',
          rules: MSG.template.user.instructions.sectionId.rules,
        },
        {
          field: 'Email',
          required: MSG.template.required.no,
          description: MSG.template.user.instructions.email.description,
          example: 'somchai@email.com',
          rules: MSG.template.user.instructions.email.rules,
        },
        {
          field: 'Tel',
          required: MSG.template.required.no,
          description: MSG.template.user.instructions.tel.description,
          example: '0812345678',
          rules: MSG.template.user.instructions.tel.rules,
        },
        {
          field: 'Role',
          required: MSG.template.required.no,
          description: MSG.template.user.instructions.role.description,
          example: 'USER',
          rules: MSG.template.user.instructions.role.rules,
        },
      ],
      additionalNotes: [
        [MSG.template.user.additionalNotes.passwordPrefix, MSG.template.user.additionalNotes.passwordText],
      ],
    })

    return workbook
  }

  /** Generates the Department import template workbook */
  static async generateDepartmentTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()

    this.buildDataSheet(workbook, {
      worksheetName: 'Data',
      columns: [
        {
          header: 'Name',
          key: 'name',
          width: 30,
          required: true,
          note: MSG.template.department.columns.name,
        },
      ],
      exampleRow: {
        name: MSG.template.department.exampleRow.name,
      },
    })

    this.buildInstructionSheet(workbook, {
      importSheetName: 'Data',
      instructions: [
        {
          field: 'Name',
          required: MSG.template.required.yes,
          description: MSG.template.department.instructions.name.description,
          example: MSG.template.department.exampleRow.name,
          rules: MSG.template.department.instructions.name.rules,
        },
      ],
    })

    return workbook
  }

  /** Generates the Section import template workbook */
  static async generateSectionTemplate(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()

    this.buildDataSheet(workbook, {
      worksheetName: 'Data',
      columns: [
        {
          header: 'Department',
          key: 'department',
          width: 30,
          required: true,
          note: MSG.template.section.columns.department,
        },
        {
          header: 'Name',
          key: 'name',
          width: 30,
          required: true,
          note: MSG.template.section.columns.name,
        },
      ],
      exampleRow: {
        department: MSG.template.section.exampleRow.department,
        name: MSG.template.section.exampleRow.name,
      },
    })

    this.buildInstructionSheet(workbook, {
      importSheetName: 'Data',
      instructions: [
        {
          field: 'Department',
          required: MSG.template.required.yes,
          description: MSG.template.section.instructions.department.description,
          example: MSG.template.section.exampleRow.department,
          rules: MSG.template.section.instructions.department.rules,
        },
        {
          field: 'Name',
          required: MSG.template.required.yes,
          description: MSG.template.section.instructions.name.description,
          example: MSG.template.section.exampleRow.name,
          rules: MSG.template.section.instructions.name.rules,
        },
      ],
      additionalNotes: [
        [MSG.template.section.additionalNotes.departmentPrefix, MSG.template.section.additionalNotes.departmentText],
      ],
    })

    return workbook
  }
}

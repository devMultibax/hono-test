import ExcelJS from 'exceljs'
import { PassThrough } from 'stream'
import type { ExportColumn, ExcelExportOptions } from '../types/export'
import { ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import type { UserWithRelations, DepartmentResponse, SectionWithRelations } from '../types'
import { formatDate, formatOptionalString, mapValue, roleMap, statusMap, auditColumns } from '../lib/export-helpers'
import { MSG } from '../constants/messages'

const MAX_ROWS_NORMAL = 10000
const MAX_ROWS_LIMIT = 50000

export class ExportService {
  // Get nested value from object (e.g., 'department.name')
  private static getNestedValue<T>(item: T, key: string): unknown {
    return key.split('.').reduce((obj: unknown, k) => {
      if (obj && typeof obj === 'object' && k in obj) {
        return (obj as Record<string, unknown>)[k]
      }
      return undefined
    }, item)
  }

  // Apply value transformer or return raw value
  private static applyValueTransformer<T>(
    item: T,
    column: ExportColumn<T>
  ): string | number | Date | null {
    const rawValue = this.getNestedValue(item, column.key)

    if (column.value) {
      return column.value(rawValue, item)
    }

    if (rawValue === null || rawValue === undefined) {
      return ''
    }

    return rawValue as string | number | Date
  }

  // Export to Excel (auto-select normal or streaming based on data size)
  static async exportToExcel<T>(
    data: T[],
    options: ExcelExportOptions<T>
  ): Promise<ExcelJS.Workbook | PassThrough> {
    const totalCount = data.length

    if (totalCount > MAX_ROWS_LIMIT) {
      throw new ValidationError(CODES.EXPORT_ROW_LIMIT_EXCEEDED, { limit: MAX_ROWS_LIMIT })
    }

    if (totalCount <= MAX_ROWS_NORMAL) {
      return this.exportToExcelNormal(data, options)
    } else {
      return this.exportToExcelStreaming(data, options)
    }
  }

  // Normal export for small datasets (< 10k rows)
  private static async exportToExcelNormal<T>(
    data: T[],
    options: ExcelExportOptions<T>
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    // Prepare data for table
    const tableData = data.map((item) =>
      options.columns.map((column) => this.applyValueTransformer(item, column))
    )

    // Add table with filter
    worksheet.addTable({
      name: 'DataTable',
      ref: 'A1',
      headerRow: true,
      totalsRow: false,
      style: {
        theme: 'TableStyleMedium2',
        showRowStripes: true
      },
      columns: options.columns.map((column) => ({
        name: column.label,
        filterButton: true
      })),
      rows: tableData
    })

    // Auto-fit column widths based on config
    worksheet.columns = options.columns.map((column) => ({
      key: column.key,
      width: column.width || 15
    }))

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }
    ]

    return workbook
  }

  // Streaming export for large datasets (10k-50k rows)
  private static async exportToExcelStreaming<T>(
    data: T[],
    options: ExcelExportOptions<T>
  ): Promise<PassThrough> {
    const stream = new PassThrough()

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: stream,
      useStyles: true,
      useSharedStrings: true
    })

    const worksheet = workbook.addWorksheet('Sheet1')

    // Set columns with headers
    worksheet.columns = options.columns.map((column) => ({
      header: column.label,
      key: column.key,
      width: column.width || 15
    }))

    // Add auto filter
    worksheet.autoFilter = {
      from: 'A1',
      to: { row: data.length + 1, column: options.columns.length }
    }

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2', activeCell: 'A2' }
    ]

    // Style header row with table-like appearance
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: false, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    }
    headerRow.alignment = { vertical: 'middle', horizontal: 'left' }
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
    headerRow.commit()

    // Add data rows with alternating colors
    let rowIndex = 0
    for (const item of data) {
      const rowData: Record<string, unknown> = {}
      options.columns.forEach((column) => {
        rowData[column.key] = this.applyValueTransformer(item, column)
      })

      const row = worksheet.addRow(rowData)

      // Add borders and alternating row colors
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        }
        // Alternating row colors
        if (rowIndex % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9E1F2' }
          }
        }
      })

      row.commit()
      rowIndex++
    }

    await worksheet.commit()
    await workbook.commit()

    return stream
  }

  // Check if result is stream or workbook
  static isStream(result: ExcelJS.Workbook | PassThrough): result is PassThrough {
    return result instanceof PassThrough
  }
}

// ─── Excel Column Definitions ────────────────────────────────────────────────
// Moved here from controllers/ to keep export-related definitions co-located.

export const userExcelColumns: ExportColumn<UserWithRelations>[] = [
  { key: 'username', label: MSG.export.user.username, width: 15 },
  { key: 'firstName', label: MSG.export.user.firstName, width: 20 },
  { key: 'lastName', label: MSG.export.user.lastName, width: 20 },
  { key: 'department.name', label: MSG.export.user.department, width: 25, value: (_, item) => item.department?.name || '' },
  { key: 'section.name', label: MSG.export.user.section, width: 25, value: (_, item) => item.section?.name || '' },
  { key: 'email', label: MSG.export.user.email, width: 30, value: formatOptionalString },
  { key: 'tel', label: MSG.export.user.tel, width: 15, value: formatOptionalString },
  { key: 'role', label: MSG.export.user.role, width: 12, value: mapValue(roleMap) },
  { key: 'status', label: MSG.export.user.status, width: 12, value: mapValue(statusMap) },
  { key: 'lastLoginAt', label: MSG.export.user.lastLoginAt, width: 20, value: formatDate },
  ...auditColumns
]

export const departmentExcelColumns: ExportColumn<DepartmentResponse>[] = [
  { key: 'name', label: MSG.export.department.name, width: 30 },
  { key: 'status', label: MSG.export.department.status, width: 12, value: mapValue(statusMap) },
  ...auditColumns
]

export const sectionExcelColumns: ExportColumn<SectionWithRelations>[] = [
  { key: 'department', label: MSG.export.section.department, width: 20, value: (_v, item) => item.department?.name ?? '' },
  { key: 'name', label: MSG.export.section.name, width: 30 },
  { key: 'status', label: MSG.export.section.status, width: 12, value: mapValue(statusMap) },
  ...auditColumns
]

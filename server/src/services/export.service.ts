import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import type { ExportColumn, ExcelExportOptions, PDFExportOptions } from '../types/export'

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
      throw new Error(`Export limited to ${MAX_ROWS_LIMIT} rows.`)
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
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
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

  // Export to PDF
  static async exportToPDF<T>(
    data: T[],
    options: PDFExportOptions<T>
  ): Promise<PassThrough> {
    const stream = new PassThrough()
    const orientation = options.orientation || 'portrait'
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: orientation })

    doc.pipe(stream)

    // Title
    doc.fontSize(16).text(options.title, { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('th-TH')}`, { align: 'center' })
    doc.moveDown(2)

    const tableTop = 120
    const itemHeight = 20

    // Build headers with positions
    let xPosition = 50
    const headers = options.columns.map((column) => {
      const header = {
        label: column.label,
        x: xPosition,
        width: column.width || 100,
        alignment: column.alignment || 'left'
      }
      xPosition += header.width
      return header
    })

    // Draw header row
    doc.fontSize(10).fillColor('#000000')
    headers.forEach((header) => {
      doc.rect(header.x, tableTop, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
      doc.fillColor('#000000').text(header.label, header.x + 5, tableTop + 5, {
        width: header.width - 10,
        align: 'left'
      })
    })

    let yPosition = tableTop + itemHeight
    const pageHeight = orientation === 'landscape' ? 500 : 700

    // Draw data rows
    data.forEach((item, index) => {
      // Check if new page needed
      if (yPosition > pageHeight) {
        doc.addPage({ margin: 50, size: 'A4', layout: orientation })
        yPosition = 50

        // Redraw headers on new page
        headers.forEach((header) => {
          doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
          doc.fillColor('#000000').text(header.label, header.x + 5, yPosition + 5, {
            width: header.width - 10,
            align: 'left'
          })
        })
        yPosition += itemHeight
      }

      // Draw row background
      const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F5F5F5'
      headers.forEach((header) => {
        doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke(fillColor, '#CCCCCC')
      })

      // Draw cell values
      doc.fillColor('#000000').fontSize(8)
      options.columns.forEach((column, colIndex) => {
        const value = this.applyValueTransformer(item, column)
        const header = headers[colIndex]
        doc.text(String(value ?? ''), header.x + 5, yPosition + 5, {
          width: header.width - 10,
          align: 'left'
        })
      })

      yPosition += itemHeight
    })

    doc.end()
    return stream
  }
}

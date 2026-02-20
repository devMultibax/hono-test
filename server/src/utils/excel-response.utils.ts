import { PassThrough } from 'stream'
import type { Context } from 'hono'
import { stream as honoStream } from 'hono/streaming'
import type ExcelJS from 'exceljs'
import type { HonoContext } from '../types'

const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/**
 * Sends an Excel workbook or PassThrough stream as an Excel file download response.
 *
 * Handles both normal (buffer) and streaming (large dataset) export modes
 * returned by `ExportService.exportToExcel()`, eliminating the ~25-line
 * if/else stream-detection block that was duplicated in every export route.
 *
 * @param c        - Hono context
 * @param result   - Return value from `ExportService.exportToExcel()`
 * @param filename - Downloaded filename (e.g. `users_2026-01-01.xlsx`)
 *
 * @example
 * const result = await ExportService.exportToExcel(data, { columns })
 * const filename = `users_${new Date().toISOString().split('T')[0]}.xlsx`
 * return sendExcelResponse(c, result, filename)
 */
export async function sendExcelResponse(
  c: Context<HonoContext>,
  result: ExcelJS.Workbook | PassThrough,
  filename: string
): Promise<Response> {
  // Streaming export (large datasets > 10k rows)
  if (result instanceof PassThrough) {
    return honoStream(c, async (outStream) => {
      c.header('Content-Type', EXCEL_CONTENT_TYPE)
      c.header('Content-Disposition', `attachment; filename="${filename}"`)

      result.on('data', (chunk: Buffer) => {
        outStream.write(chunk)
      })

      return new Promise<void>((resolve, reject) => {
        result.on('end', () => {
          outStream.close()
          resolve()
        })
        result.on('error', reject)
      })
    })
  }

  // Normal workbook (small to medium datasets ≤ 10k rows)
  const buffer = await result.xlsx.writeBuffer()
  c.header('Content-Type', EXCEL_CONTENT_TYPE)
  c.header('Content-Disposition', `attachment; filename="${filename}"`)
  return c.body(buffer)
}

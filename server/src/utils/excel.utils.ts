import * as XLSX from 'xlsx'

export interface ExcelValidationResult {
    valid: boolean
    errors: string[]
}

export function validateExcelFile(
    fileBuffer: Buffer,
    requiredColumns: string[]
): ExcelValidationResult {
    const errors: string[] = []

    try {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

        if (workbook.SheetNames.length === 0) {
            return { valid: false, errors: ['Excel file has no worksheets'] }
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]

        if (data.length === 0) {
            return { valid: false, errors: ['Excel file is empty'] }
        }

        const headers = data[0] as string[]
        for (const col of requiredColumns) {
            if (!headers.includes(col)) {
                errors.push(`Missing required column: ${col}`)
            }
        }

        if (data.length === 1) {
            errors.push('No data rows found')
        }
    } catch (error: unknown) {
        errors.push(`Invalid Excel file: ${error instanceof Error ? error.message : String(error)}`)
    }

    return { valid: errors.length === 0, errors }
}

import * as XLSX from 'xlsx'
import { DepartmentService } from './department.service'
import { SectionService } from './section.service'
import { UserService } from './user.service'
import { Role } from '../types'

export interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; error: string }>
}

export class ImportService {
  /**
   * Import departments from Excel file
   */
  static async importDepartments(
    fileBuffer: Buffer,
    createdBy: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const data = XLSX.utils.sheet_to_json<{ Name: string; Status?: string }>(worksheet)

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          if (!row.Name || row.Name.trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Department name is required'
            })
            result.failed++
            continue
          }

          const name = row.Name.trim()

          if (name.length > 100) {
            result.errors.push({
              row: rowNumber,
              error: 'Department name is too long (max 100 characters)'
            })
            result.failed++
            continue
          }

          await DepartmentService.create(name, createdBy)
          result.success++
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error'
          })
          result.failed++
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to process Excel file: ${error.message}`)
    }

    return result
  }

  /**
   * Import sections from Excel file
   */
  static async importSections(
    fileBuffer: Buffer,
    createdBy: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const data = XLSX.utils.sheet_to_json<{
        'Department ID': number
        Name: string
        Status?: string
      }>(worksheet)

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          if (!row['Department ID']) {
            result.errors.push({
              row: rowNumber,
              error: 'Department ID is required'
            })
            result.failed++
            continue
          }

          if (!row.Name || row.Name.trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Section name is required'
            })
            result.failed++
            continue
          }

          const departmentId = Number(row['Department ID'])
          const name = row.Name.trim()

          if (isNaN(departmentId) || departmentId <= 0) {
            result.errors.push({
              row: rowNumber,
              error: 'Department ID must be a positive number'
            })
            result.failed++
            continue
          }

          if (name.length > 100) {
            result.errors.push({
              row: rowNumber,
              error: 'Section name is too long (max 100 characters)'
            })
            result.failed++
            continue
          }

          await SectionService.create(departmentId, name, createdBy)
          result.success++
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error'
          })
          result.failed++
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to process Excel file: ${error.message}`)
    }

    return result
  }

  /**
   * Import users from Excel file
   */
  static async importUsers(
    fileBuffer: Buffer,
    createdBy: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const data = XLSX.utils.sheet_to_json<{
        Username: string
        Password: string
        'First Name': string
        'Last Name': string
        'Department ID': number
        'Section ID'?: number
        Email?: string
        Tel?: string
        Role?: string
      }>(worksheet)

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          // Validate required fields
          if (!row.Username || row.Username.trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Username is required'
            })
            result.failed++
            continue
          }

          if (!row.Password || row.Password.trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Password is required'
            })
            result.failed++
            continue
          }

          if (!row['First Name'] || row['First Name'].trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'First name is required'
            })
            result.failed++
            continue
          }

          if (!row['Last Name'] || row['Last Name'].trim() === '') {
            result.errors.push({
              row: rowNumber,
              error: 'Last name is required'
            })
            result.failed++
            continue
          }

          if (!row['Department ID']) {
            result.errors.push({
              row: rowNumber,
              error: 'Department ID is required'
            })
            result.failed++
            continue
          }

          const username = row.Username.trim()
          const password = row.Password.trim()
          const firstName = row['First Name'].trim()
          const lastName = row['Last Name'].trim()
          const departmentId = Number(row['Department ID'])
          const sectionId = row['Section ID'] ? Number(row['Section ID']) : null
          const email = row.Email ? row.Email.trim() : null
          const tel = row.Tel ? row.Tel.trim() : null
          const role = row.Role && row.Role.trim().toUpperCase() === 'ADMIN' ? Role.ADMIN : Role.USER

          // Validate username length
          if (username.length !== 6) {
            result.errors.push({
              row: rowNumber,
              error: 'Username must be exactly 6 characters'
            })
            result.failed++
            continue
          }

          // Validate username format
          if (!/^[a-zA-Z0-9]+$/.test(username)) {
            result.errors.push({
              row: rowNumber,
              error: 'Username must contain only letters and numbers'
            })
            result.failed++
            continue
          }

          // Validate password length
          if (password.length < 6) {
            result.errors.push({
              row: rowNumber,
              error: 'Password must be at least 6 characters'
            })
            result.failed++
            continue
          }

          // Validate department ID
          if (isNaN(departmentId) || departmentId <= 0) {
            result.errors.push({
              row: rowNumber,
              error: 'Department ID must be a positive number'
            })
            result.failed++
            continue
          }

          // Validate section ID if provided
          if (sectionId !== null && (isNaN(sectionId) || sectionId <= 0)) {
            result.errors.push({
              row: rowNumber,
              error: 'Section ID must be a positive number'
            })
            result.failed++
            continue
          }

          // Validate email format if provided
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            result.errors.push({
              row: rowNumber,
              error: 'Invalid email format'
            })
            result.failed++
            continue
          }

          // Validate tel format if provided
          if (tel && (tel.length !== 10 || !/^[0-9]+$/.test(tel))) {
            result.errors.push({
              row: rowNumber,
              error: 'Phone number must be exactly 10 digits'
            })
            result.failed++
            continue
          }

          await UserService.create(
            username,
            password,
            firstName,
            lastName,
            departmentId,
            sectionId,
            email,
            tel,
            role,
            createdBy
          )
          result.success++
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            error: error.message || 'Unknown error'
          })
          result.failed++
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to process Excel file: ${error.message}`)
    }

    return result
  }

  /**
   * Validate Excel file structure for departments
   */
  static validateDepartmentFile(fileBuffer: Buffer): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

      if (workbook.SheetNames.length === 0) {
        errors.push('Excel file has no worksheets')
        return { valid: false, errors }
      }

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      if (data.length === 0) {
        errors.push('Excel file is empty')
        return { valid: false, errors }
      }

      const headers = data[0] as string[]

      if (!headers.includes('Name')) {
        errors.push('Missing required column: Name')
      }

      if (data.length === 1) {
        errors.push('No data rows found')
      }

    } catch (error: any) {
      errors.push(`Invalid Excel file: ${error.message}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate Excel file structure for sections
   */
  static validateSectionFile(fileBuffer: Buffer): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

      if (workbook.SheetNames.length === 0) {
        errors.push('Excel file has no worksheets')
        return { valid: false, errors }
      }

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      if (data.length === 0) {
        errors.push('Excel file is empty')
        return { valid: false, errors }
      }

      const headers = data[0] as string[]

      if (!headers.includes('Department ID')) {
        errors.push('Missing required column: Department ID')
      }

      if (!headers.includes('Name')) {
        errors.push('Missing required column: Name')
      }

      if (data.length === 1) {
        errors.push('No data rows found')
      }

    } catch (error: any) {
      errors.push(`Invalid Excel file: ${error.message}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate Excel file structure for users
   */
  static validateUserFile(fileBuffer: Buffer): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })

      if (workbook.SheetNames.length === 0) {
        errors.push('Excel file has no worksheets')
        return { valid: false, errors }
      }

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

      if (data.length === 0) {
        errors.push('Excel file is empty')
        return { valid: false, errors }
      }

      const headers = data[0] as string[]
      const requiredColumns = ['Username', 'Password', 'First Name', 'Last Name', 'Department ID']

      for (const column of requiredColumns) {
        if (!headers.includes(column)) {
          errors.push(`Missing required column: ${column}`)
        }
      }

      if (data.length === 1) {
        errors.push('No data rows found')
      }

    } catch (error: any) {
      errors.push(`Invalid Excel file: ${error.message}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

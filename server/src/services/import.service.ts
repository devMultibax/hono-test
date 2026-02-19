import * as XLSX from 'xlsx'
import { DepartmentService } from './department.service'
import { SectionService } from './section.service'
import { UserService } from './user.service'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { Role } from '../types'

export interface ImportRowError {
  row: number
  code: string
  params?: Record<string, unknown>
}

export interface ImportResult {
  success: number
  failed: number
  errors: ImportRowError[]
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
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_DEPT_NAME_REQUIRED })
            result.failed++
            continue
          }

          const name = row.Name.trim()

          if (name.length > 100) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_DEPT_NAME_TOO_LONG, params: { max: 100 } })
            result.failed++
            continue
          }

          await DepartmentService.create(name, createdBy)
          result.success++
        } catch (error: any) {
          result.errors.push({ row: rowNumber, code: error.message || CODES.IMPORT_UNKNOWN_ERROR })
          result.failed++
        }
      }
    } catch (error: any) {
      throw new AppError(500, CODES.IMPORT_PROCESS_FAILED, { reason: error.message })
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
        Department: string
        Name: string
        Status?: string
      }>(worksheet)

      // Pre-load departments for name lookup
      const allDepartments = await prisma.department.findMany({
        select: { id: true, name: true, status: true }
      })
      const departmentMap = new Map(
        allDepartments
          .filter(d => d.status === 'active')
          .map(d => [d.name.trim().toLowerCase(), d.id])
      )

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          if (!row.Department || String(row.Department).trim() === '') {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_DEPT_REQUIRED })
            result.failed++
            continue
          }

          if (!row.Name || row.Name.trim() === '') {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_NAME_REQUIRED })
            result.failed++
            continue
          }

          const departmentName = String(row.Department).trim()
          const name = row.Name.trim()

          const departmentId = departmentMap.get(departmentName.toLowerCase())

          if (!departmentId) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_DEPT_NOT_FOUND, params: { name: departmentName } })
            result.failed++
            continue
          }

          if (name.length > 100) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_NAME_TOO_LONG, params: { max: 100 } })
            result.failed++
            continue
          }

          await SectionService.create(departmentId, name, createdBy)
          result.success++
        } catch (error: any) {
          result.errors.push({ row: rowNumber, code: error.message || CODES.IMPORT_UNKNOWN_ERROR })
          result.failed++
        }
      }
    } catch (error: any) {
      throw new AppError(500, CODES.IMPORT_PROCESS_FAILED, { reason: error.message })
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
        'First Name': string
        'Last Name': string
        'Department ID': number
        'Section ID'?: number
        Email?: string
        Tel?: string
        Role?: string
      }>(worksheet)

      // Pre-load lookup data for validation
      const [allDepartments, allSections, existingUsers] = await Promise.all([
        prisma.department.findMany({ select: { id: true, status: true } }),
        prisma.section.findMany({ select: { id: true, departmentId: true, status: true } }),
        prisma.user.findMany({ select: { username: true } }),
      ])

      const activeDepartmentIds = new Set(
        allDepartments.filter(d => d.status === 'active').map(d => d.id)
      )
      const sectionMap = new Map(
        allSections.filter(s => s.status === 'active').map(s => [s.id, s.departmentId])
      )
      const existingUsernames = new Set(existingUsers.map(u => u.username))
      const batchUsernames = new Set<string>()

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2

        try {
          // Validate required fields
          if (!row.Username || String(row.Username).trim() === '') {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_USERNAME_REQUIRED })
            result.failed++
            continue
          }

          if (!row['First Name'] || String(row['First Name']).trim() === '') {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_FIRST_NAME_REQUIRED })
            result.failed++
            continue
          }

          if (!row['Last Name'] || String(row['Last Name']).trim() === '') {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_LAST_NAME_REQUIRED })
            result.failed++
            continue
          }

          if (!row['Department ID']) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_DEPT_ID_REQUIRED })
            result.failed++
            continue
          }

          const username = String(row.Username).trim()
          const firstName = String(row['First Name']).trim()
          const lastName = String(row['Last Name']).trim()
          const departmentId = Number(row['Department ID'])
          const sectionId = row['Section ID'] ? Number(row['Section ID']) : null
          const email = row.Email ? String(row.Email).trim() : null
          const tel = row.Tel ? String(row.Tel).trim() : null
          const role = row.Role && String(row.Role).trim().toUpperCase() === 'ADMIN' ? Role.ADMIN : Role.USER

          // Validate username format
          if (username.length !== 6) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_USERNAME_LENGTH })
            result.failed++
            continue
          }

          if (!/^[a-zA-Z0-9]+$/.test(username)) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_USERNAME_FORMAT })
            result.failed++
            continue
          }

          // Validate username uniqueness (DB)
          if (existingUsernames.has(username)) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_USERNAME_EXISTS, params: { username } })
            result.failed++
            continue
          }

          // Validate username uniqueness (within this import batch)
          if (batchUsernames.has(username)) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_USERNAME_DUPLICATE, params: { username } })
            result.failed++
            continue
          }

          // Validate department exists
          if (isNaN(departmentId) || departmentId <= 0) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_DEPT_ID_INVALID })
            result.failed++
            continue
          }

          if (!activeDepartmentIds.has(departmentId)) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_DEPT_NOT_FOUND, params: { departmentId } })
            result.failed++
            continue
          }

          // Validate section exists and belongs to department
          if (sectionId !== null) {
            if (isNaN(sectionId) || sectionId <= 0) {
              result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_SECTION_ID_INVALID })
              result.failed++
              continue
            }

            const sectionDeptId = sectionMap.get(sectionId)
            if (sectionDeptId === undefined) {
              result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_SECTION_NOT_FOUND, params: { sectionId } })
              result.failed++
              continue
            }

            if (sectionDeptId !== departmentId) {
              result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_SECTION_DEPT_MISMATCH, params: { sectionId, departmentId } })
              result.failed++
              continue
            }
          }

          // Validate email format
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_EMAIL_INVALID, params: { email } })
            result.failed++
            continue
          }

          // Validate tel format
          if (tel && (tel.length !== 10 || !/^[0-9]+$/.test(tel))) {
            result.errors.push({ row: rowNumber, code: CODES.IMPORT_USER_TEL_INVALID, params: { tel } })
            result.failed++
            continue
          }

          await UserService.create(
            username,
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
          existingUsernames.add(username)
          batchUsernames.add(username)
        } catch (error: any) {
          result.errors.push({ row: rowNumber, code: error.message || CODES.IMPORT_UNKNOWN_ERROR })
          result.failed++
        }
      }
    } catch (error: any) {
      throw new AppError(500, CODES.IMPORT_PROCESS_FAILED, { reason: error.message })
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

      if (!headers.includes('Department')) {
        errors.push('Missing required column: Department')
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
      const requiredColumns = ['Username', 'First Name', 'Last Name', 'Department ID']

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

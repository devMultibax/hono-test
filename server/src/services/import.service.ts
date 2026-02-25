import * as XLSX from 'xlsx'
import { validateExcelFile, type ExcelValidationResult } from '../utils/excel.utils'
import { DepartmentService } from './department.service'
import { SectionService } from './section.service'
import { UserService } from './user.service'
import { prisma } from '../lib/prisma'
import { AppError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { Role } from '../types'

const MAX_IMPORT_ROWS = 1000

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

interface UserImportRow {
  Username: string
  First_Name: string
  Last_Name: string
  Department_ID: number
  Section_ID?: number
  Email?: string
  Tel?: string
  Role?: string
}

interface UserLookups {
  activeDepartmentIds: Set<number>
  sectionMap: Map<number, number>
  existingUsernames: Set<string>
  batchUsernames: Set<string>
  existingEmails: Set<string>
  batchEmails: Set<string>
}

export class ImportService {
  // ── Shared helpers ──

  private static parseExcel<T>(buffer: Buffer): T[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json<T>(worksheet)
  }

  private static validateRowLimit(count: number): void {
    if (count > MAX_IMPORT_ROWS) {
      throw new AppError(
        400,
        CODES.IMPORT_ROW_LIMIT_EXCEEDED,
        MSG.errors.import.rowLimitExceeded,
        { max: MAX_IMPORT_ROWS, received: count }
      )
    }
  }

  private static async processRows<T>(
    data: T[],
    processor: (row: T, rowNumber: number, result: ImportResult) => Promise<void>
  ): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] }

    for (let i = 0; i < data.length; i++) {
      const prevFailed = result.failed
      await processor(data[i], i + 2, result)
      if (result.failed === prevFailed) {
        result.success++
      }
    }

    return result
  }

  // ── User-specific helpers ──

  private static async preloadUserLookups(): Promise<UserLookups> {
    const [allDepartments, allSections, existingUsers] = await Promise.all([
      prisma.department.findMany({ select: { id: true, status: true } }),
      prisma.section.findMany({ select: { id: true, departmentId: true, status: true } }),
      prisma.user.findMany({ select: { username: true, email: true } }),
    ])

    return {
      activeDepartmentIds: new Set(
        allDepartments.filter(d => d.status === 'active').map(d => d.id)
      ),
      sectionMap: new Map(
        allSections.filter(s => s.status === 'active').map(s => [s.id, s.departmentId])
      ),
      existingUsernames: new Set(existingUsers.map(u => u.username)),
      batchUsernames: new Set<string>(),
      existingEmails: new Set(existingUsers.filter(u => u.email).map(u => u.email!.toLowerCase())),
      batchEmails: new Set<string>(),
    }
  }

  private static async processUserRow(
    row: UserImportRow,
    rowNumber: number,
    lookups: UserLookups,
    createdBy: string,
    result: ImportResult
  ): Promise<void> {
    const pushError = (code: string, params?: Record<string, unknown>) => {
      result.errors.push({ row: rowNumber, code, params })
      result.failed++
    }

    if (!row.Username || String(row.Username).trim() === '') {
      return pushError(CODES.IMPORT_USER_USERNAME_REQUIRED)
    }
    if (!row['First_Name'] || String(row['First_Name']).trim() === '') {
      return pushError(CODES.IMPORT_USER_FIRST_NAME_REQUIRED)
    }
    if (!row['Last_Name'] || String(row['Last_Name']).trim() === '') {
      return pushError(CODES.IMPORT_USER_LAST_NAME_REQUIRED)
    }
    if (!row['Department_ID']) {
      return pushError(CODES.IMPORT_USER_DEPT_ID_REQUIRED)
    }

    const username = String(row.Username).trim()
    const firstName = String(row['First_Name']).trim()
    const lastName = String(row['Last_Name']).trim()
    const departmentId = Number(row['Department_ID'])
    const sectionId = row['Section_ID'] ? Number(row['Section_ID']) : null
    const email = row.Email ? String(row.Email).trim() : null
    const tel = row.Tel ? String(row.Tel).trim() : null
    const role = row.Role && String(row.Role).trim().toUpperCase() === 'ADMIN' ? Role.ADMIN : Role.USER

    if (username.length !== 6) return pushError(CODES.IMPORT_USER_USERNAME_LENGTH)
    if (!/^[a-zA-Z0-9]+$/.test(username)) return pushError(CODES.IMPORT_USER_USERNAME_FORMAT)
    if (lookups.existingUsernames.has(username)) return pushError(CODES.IMPORT_USER_USERNAME_EXISTS, { username })
    if (lookups.batchUsernames.has(username)) return pushError(CODES.IMPORT_USER_USERNAME_DUPLICATE, { username })

    if (isNaN(departmentId) || departmentId <= 0) return pushError(CODES.IMPORT_USER_DEPT_ID_INVALID)
    if (!lookups.activeDepartmentIds.has(departmentId)) return pushError(CODES.IMPORT_USER_DEPT_NOT_FOUND, { departmentId })

    if (sectionId !== null) {
      if (isNaN(sectionId) || sectionId <= 0) return pushError(CODES.IMPORT_USER_SECTION_ID_INVALID)
      const sectionDeptId = lookups.sectionMap.get(sectionId)
      if (sectionDeptId === undefined) return pushError(CODES.IMPORT_USER_SECTION_NOT_FOUND, { sectionId })
      if (sectionDeptId !== departmentId) return pushError(CODES.IMPORT_USER_SECTION_DEPT_MISMATCH, { sectionId, departmentId })
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return pushError(CODES.IMPORT_USER_EMAIL_INVALID, { email })
      const emailLower = email.toLowerCase()
      if (lookups.existingEmails.has(emailLower)) return pushError(CODES.IMPORT_USER_EMAIL_EXISTS, { email })
      if (lookups.batchEmails.has(emailLower)) return pushError(CODES.IMPORT_USER_EMAIL_DUPLICATE, { email })
    }
    if (tel && (tel.length !== 10 || !/^[0-9]+$/.test(tel))) return pushError(CODES.IMPORT_USER_TEL_INVALID, { tel })

    try {
      await UserService.create(username, firstName, lastName, departmentId, sectionId, email, tel, role, createdBy)
      lookups.existingUsernames.add(username)
      lookups.batchUsernames.add(username)
      if (email) lookups.batchEmails.add(email.toLowerCase())
    } catch (error: unknown) {
      pushError(error instanceof Error ? error.message : CODES.IMPORT_UNKNOWN_ERROR)
    }
  }

  // ── Public methods ──

  static async importDepartments(fileBuffer: Buffer, createdBy: string): Promise<ImportResult> {
    try {
      const data = this.parseExcel<{ Name: string; Status?: string }>(fileBuffer)
      this.validateRowLimit(data.length)

      return await this.processRows(data, async (row, rowNumber, result) => {
        if (!row.Name || row.Name.trim() === '') {
          result.errors.push({ row: rowNumber, code: CODES.IMPORT_DEPT_NAME_REQUIRED })
          result.failed++
          return
        }

        const name = row.Name.trim()

        if (name.length > 100) {
          result.errors.push({ row: rowNumber, code: CODES.IMPORT_DEPT_NAME_TOO_LONG, params: { max: 100 } })
          result.failed++
          return
        }

        try {
          await DepartmentService.create(name, createdBy)
        } catch (error: unknown) {
          result.errors.push({ row: rowNumber, code: error instanceof Error ? error.message : CODES.IMPORT_UNKNOWN_ERROR })
          result.failed++
        }
      })
    } catch (error: unknown) {
      if (error instanceof AppError) throw error
      throw new AppError(500, CODES.IMPORT_PROCESS_FAILED, MSG.errors.import.processFailed, {
        reason: error instanceof Error ? error.message : String(error)
      })
    }
  }

  static async importSections(fileBuffer: Buffer, createdBy: string): Promise<ImportResult> {
    try {
      const data = this.parseExcel<{ Department: string; Name: string; Status?: string }>(fileBuffer)
      this.validateRowLimit(data.length)

      const allDepartments = await prisma.department.findMany({
        select: { id: true, name: true, status: true }
      })
      const departmentMap = new Map(
        allDepartments
          .filter(d => d.status === 'active')
          .map(d => [d.name.trim().toLowerCase(), d.id])
      )

      return await this.processRows(data, async (row, rowNumber, result) => {
        if (!row.Department || String(row.Department).trim() === '') {
          result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_DEPT_REQUIRED })
          result.failed++
          return
        }

        if (!row.Name || row.Name.trim() === '') {
          result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_NAME_REQUIRED })
          result.failed++
          return
        }

        const departmentName = String(row.Department).trim()
        const name = row.Name.trim()
        const departmentId = departmentMap.get(departmentName.toLowerCase())

        if (!departmentId) {
          result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_DEPT_NOT_FOUND, params: { name: departmentName } })
          result.failed++
          return
        }

        if (name.length > 100) {
          result.errors.push({ row: rowNumber, code: CODES.IMPORT_SECTION_NAME_TOO_LONG, params: { max: 100 } })
          result.failed++
          return
        }

        try {
          await SectionService.create(departmentId, name, createdBy)
        } catch (error: unknown) {
          result.errors.push({ row: rowNumber, code: error instanceof Error ? error.message : CODES.IMPORT_UNKNOWN_ERROR })
          result.failed++
        }
      })
    } catch (error: unknown) {
      if (error instanceof AppError) throw error
      throw new AppError(500, CODES.IMPORT_PROCESS_FAILED, MSG.errors.import.processFailed, {
        reason: error instanceof Error ? error.message : String(error)
      })
    }
  }

  static async importUsers(fileBuffer: Buffer, createdBy: string): Promise<ImportResult> {
    try {
      const data = this.parseExcel<UserImportRow>(fileBuffer)
      this.validateRowLimit(data.length)
      const lookups = await this.preloadUserLookups()

      return await this.processRows(data, async (row, rowNumber, result) => {
        await this.processUserRow(row, rowNumber, lookups, createdBy, result)
      })
    } catch (error: unknown) {
      if (error instanceof AppError) throw error
      throw new AppError(500, CODES.IMPORT_PROCESS_FAILED, MSG.errors.import.processFailed, {
        reason: error instanceof Error ? error.message : String(error)
      })
    }
  }

  static validateDepartmentFile(fileBuffer: Buffer): ExcelValidationResult {
    return validateExcelFile(fileBuffer, ['Name'])
  }

  static validateSectionFile(fileBuffer: Buffer): ExcelValidationResult {
    return validateExcelFile(fileBuffer, ['Department', 'Name'])
  }

  static validateUserFile(fileBuffer: Buffer): ExcelValidationResult {
    return validateExcelFile(fileBuffer, ['Username', 'First_Name', 'Last_Name', 'Department_ID'])
  }
}

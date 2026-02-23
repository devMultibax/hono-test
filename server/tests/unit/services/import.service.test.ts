import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../../mocks/prisma.mock'
import { AppError } from '../../../src/lib/errors'
import { CODES } from '../../../src/constants/error-codes'

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn()
  }
}))

import * as XLSX from 'xlsx'
import { ImportService } from '../../../src/services/import.service'

const MAX_IMPORT_ROWS = 1000

function setupMockWorkbook(rows: unknown[]) {
  vi.mocked(XLSX.read).mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} }
  } as any)
  vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue(rows as any)
}

describe('ImportService - row limit enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('importDepartments', () => {
    it('throws IMPORT_ROW_LIMIT_EXCEEDED for 1001 rows', async () => {
      setupMockWorkbook(Array(1001).fill({ Name: 'Dept' }))

      await expect(ImportService.importDepartments(Buffer.from('test'), 'admin'))
        .rejects.toSatisfy((err: unknown) =>
          err instanceof AppError && err.message === CODES.IMPORT_ROW_LIMIT_EXCEEDED
        )
    })

    it('does not throw IMPORT_ROW_LIMIT_EXCEEDED for exactly 1000 rows', async () => {
      setupMockWorkbook(Array(MAX_IMPORT_ROWS).fill({ Name: 'Dept' }))

      let thrownError: unknown = null
      try {
        await ImportService.importDepartments(Buffer.from('test'), 'admin')
      } catch (err) {
        thrownError = err
      }

      if (thrownError instanceof AppError) {
        expect(thrownError.message).not.toBe(CODES.IMPORT_ROW_LIMIT_EXCEEDED)
      }
    })

    it('includes max and received counts in error details', async () => {
      const oversizedRows = Array(1500).fill({ Name: 'Dept' })
      setupMockWorkbook(oversizedRows)

      try {
        await ImportService.importDepartments(Buffer.from('test'), 'admin')
        expect.fail('Should have thrown')
      } catch (err) {
        expect(err).toBeInstanceOf(AppError)
        const appErr = err as AppError
        expect(appErr.details).toMatchObject({ max: MAX_IMPORT_ROWS, received: 1500 })
      }
    })
  })

  describe('importSections', () => {
    it('throws IMPORT_ROW_LIMIT_EXCEEDED for 1001 rows', async () => {
      setupMockWorkbook(Array(1001).fill({ Department: 'IT', Name: 'Section' }))

      await expect(ImportService.importSections(Buffer.from('test'), 'admin'))
        .rejects.toSatisfy((err: unknown) =>
          err instanceof AppError && err.message === CODES.IMPORT_ROW_LIMIT_EXCEEDED
        )
    })

    it('does not throw IMPORT_ROW_LIMIT_EXCEEDED for exactly 1000 rows', async () => {
      setupMockWorkbook(Array(MAX_IMPORT_ROWS).fill({ Department: 'IT', Name: 'Section' }))

      let thrownError: unknown = null
      try {
        await ImportService.importSections(Buffer.from('test'), 'admin')
      } catch (err) {
        thrownError = err
      }

      if (thrownError instanceof AppError) {
        expect(thrownError.message).not.toBe(CODES.IMPORT_ROW_LIMIT_EXCEEDED)
      }
    })
  })

  describe('importUsers', () => {
    it('throws IMPORT_ROW_LIMIT_EXCEEDED for 1001 rows', async () => {
      setupMockWorkbook(Array(1001).fill({
        Username: 'user01',
        'First Name': 'Test',
        'Last Name': 'User',
        'Department ID': 1
      }))

      await expect(ImportService.importUsers(Buffer.from('test'), 'admin'))
        .rejects.toSatisfy((err: unknown) =>
          err instanceof AppError && err.message === CODES.IMPORT_ROW_LIMIT_EXCEEDED
        )
    })

    it('does not throw IMPORT_ROW_LIMIT_EXCEEDED for exactly 1000 rows', async () => {
      setupMockWorkbook(Array(MAX_IMPORT_ROWS).fill({
        Username: 'user01',
        'First Name': 'Test',
        'Last Name': 'User',
        'Department ID': 1
      }))

      let thrownError: unknown = null
      try {
        await ImportService.importUsers(Buffer.from('test'), 'admin')
      } catch (err) {
        thrownError = err
      }

      if (thrownError instanceof AppError) {
        expect(thrownError.message).not.toBe(CODES.IMPORT_ROW_LIMIT_EXCEEDED)
      }
    })
  })
})

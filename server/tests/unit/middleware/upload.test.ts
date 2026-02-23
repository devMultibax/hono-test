import { describe, it, expect } from 'vitest'
import { validateFile } from '../../../src/middleware/upload'

// XLSX magic bytes: PK (ZIP format)
const XLSX_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04, ...Array(100).fill(0)])
// XLS magic bytes: Compound Document Binary Format
const XLS_MAGIC = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, ...Array(100).fill(0)])
// Invalid bytes (disguised file)
const FAKE_BYTES = Buffer.from([0x00, 0x00, 0x00, 0x00, ...Array(100).fill(0)])

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const XLS_MIME = 'application/vnd.ms-excel'

describe('upload middleware - validateFile', () => {
  describe('size validation', () => {
    it('rejects files exceeding 10MB', () => {
      const result = validateFile({
        filename: 'large.xlsx',
        mimeType: XLSX_MIME,
        size: 11 * 1024 * 1024,
        buffer: Buffer.alloc(11 * 1024 * 1024)
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/size/i)
    })

    it('accepts files at exactly 10MB', () => {
      const buf = Buffer.concat([XLSX_MAGIC, Buffer.alloc(10 * 1024 * 1024 - XLSX_MAGIC.length)])
      const result = validateFile({
        filename: 'max.xlsx',
        mimeType: XLSX_MIME,
        size: buf.length,
        buffer: buf
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('MIME type validation', () => {
    it('rejects unsupported MIME types', () => {
      const result = validateFile({
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        size: XLSX_MAGIC.length,
        buffer: XLSX_MAGIC
      })
      expect(result.valid).toBe(false)
    })

    it('rejects application/octet-stream', () => {
      const result = validateFile({
        filename: 'test.xlsx',
        mimeType: 'application/octet-stream',
        size: XLSX_MAGIC.length,
        buffer: XLSX_MAGIC
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('extension validation', () => {
    it('rejects .csv extension', () => {
      const result = validateFile({
        filename: 'test.csv',
        mimeType: XLSX_MIME,
        size: XLSX_MAGIC.length,
        buffer: XLSX_MAGIC
      })
      expect(result.valid).toBe(false)
    })

    it('rejects no extension', () => {
      const result = validateFile({
        filename: 'testfile',
        mimeType: XLSX_MIME,
        size: XLSX_MAGIC.length,
        buffer: XLSX_MAGIC
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('magic byte validation', () => {
    it('accepts valid .xlsx file with correct PK magic bytes', () => {
      const result = validateFile({
        filename: 'data.xlsx',
        mimeType: XLSX_MIME,
        size: XLSX_MAGIC.length,
        buffer: XLSX_MAGIC
      })
      expect(result.valid).toBe(true)
    })

    it('accepts valid .xls file with correct Compound Document magic bytes', () => {
      const result = validateFile({
        filename: 'data.xls',
        mimeType: XLS_MIME,
        size: XLS_MAGIC.length,
        buffer: XLS_MAGIC
      })
      expect(result.valid).toBe(true)
    })

    it('rejects .xlsx file with wrong magic bytes (disguised file)', () => {
      const result = validateFile({
        filename: 'malicious.xlsx',
        mimeType: XLSX_MIME,
        size: FAKE_BYTES.length,
        buffer: FAKE_BYTES
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/does not match/i)
    })

    it('rejects .xls file with wrong magic bytes (disguised file)', () => {
      const result = validateFile({
        filename: 'malicious.xls',
        mimeType: XLS_MIME,
        size: FAKE_BYTES.length,
        buffer: FAKE_BYTES
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/does not match/i)
    })

    it('rejects .xls magic bytes when claiming to be .xlsx', () => {
      const result = validateFile({
        filename: 'renamed.xlsx',
        mimeType: XLSX_MIME,
        size: XLS_MAGIC.length,
        buffer: XLS_MAGIC
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/does not match/i)
    })

    it('rejects .xlsx magic bytes when claiming to be .xls', () => {
      const result = validateFile({
        filename: 'renamed.xls',
        mimeType: XLS_MIME,
        size: XLSX_MAGIC.length,
        buffer: XLSX_MAGIC
      })
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/does not match/i)
    })
  })
})

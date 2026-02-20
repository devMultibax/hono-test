import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { TemplateService } from '../../../src/services/template.service'

describe('TemplateService', () => {
  describe('generateUserTemplate', () => {
    it('returns an ExcelJS Workbook with two sheets', async () => {
      const wb = await TemplateService.generateUserTemplate()
      expect(wb).toBeInstanceOf(ExcelJS.Workbook)
      expect(wb.worksheets).toHaveLength(2)
    })

    it('first sheet is named "User Import"', async () => {
      const wb = await TemplateService.generateUserTemplate()
      expect(wb.worksheets[0].name).toBe('User Import')
    })

    it('second sheet is named "คำอธิบาย"', async () => {
      const wb = await TemplateService.generateUserTemplate()
      expect(wb.worksheets[1].name).toBe('คำอธิบาย')
    })

    it('first sheet has 8 columns (Username → Role)', async () => {
      const wb = await TemplateService.generateUserTemplate()
      const ws = wb.worksheets[0]
      expect(ws.columns).toHaveLength(8)
    })

    it('header row is bold and white text', async () => {
      const wb = await TemplateService.generateUserTemplate()
      const ws = wb.worksheets[0]
      const headerCell = ws.getRow(1).getCell(1)
      expect(headerCell.font?.bold).toBe(true)
      expect(headerCell.font?.color?.argb).toBe('FFFFFFFF')
    })

    it('example row exists on row 2', async () => {
      const wb = await TemplateService.generateUserTemplate()
      const ws = wb.worksheets[0]
      const exampleRow = ws.getRow(2)
      expect(exampleRow.getCell(1).value).toBe('100001')
    })

    it('can be written to a buffer without errors', async () => {
      const wb = await TemplateService.generateUserTemplate()
      const buffer = await wb.xlsx.writeBuffer()
      expect(buffer.byteLength).toBeGreaterThan(0)
    })
  })

  describe('generateDepartmentTemplate', () => {
    it('returns an ExcelJS Workbook with two sheets', async () => {
      const wb = await TemplateService.generateDepartmentTemplate()
      expect(wb).toBeInstanceOf(ExcelJS.Workbook)
      expect(wb.worksheets).toHaveLength(2)
    })

    it('first sheet is named "Department Import"', async () => {
      const wb = await TemplateService.generateDepartmentTemplate()
      expect(wb.worksheets[0].name).toBe('Department Import')
    })

    it('first sheet has 1 column (Name)', async () => {
      const wb = await TemplateService.generateDepartmentTemplate()
      const ws = wb.worksheets[0]
      expect(ws.columns).toHaveLength(1)
    })

    it('example row contains expected department name', async () => {
      const wb = await TemplateService.generateDepartmentTemplate()
      const ws = wb.worksheets[0]
      expect(ws.getRow(2).getCell(1).value).toBe('ฝ่ายบริหาร')
    })
  })

  describe('generateSectionTemplate', () => {
    it('returns an ExcelJS Workbook with two sheets', async () => {
      const wb = await TemplateService.generateSectionTemplate()
      expect(wb).toBeInstanceOf(ExcelJS.Workbook)
      expect(wb.worksheets).toHaveLength(2)
    })

    it('first sheet is named "Section Import"', async () => {
      const wb = await TemplateService.generateSectionTemplate()
      expect(wb.worksheets[0].name).toBe('Section Import')
    })

    it('first sheet has 2 columns (Department, Name)', async () => {
      const wb = await TemplateService.generateSectionTemplate()
      const ws = wb.worksheets[0]
      expect(ws.columns).toHaveLength(2)
    })

    it('example row contains expected section name', async () => {
      const wb = await TemplateService.generateSectionTemplate()
      const ws = wb.worksheets[0]
      expect(ws.getRow(2).getCell(2).value).toBe('แผนกบุคคล')
    })
  })
})

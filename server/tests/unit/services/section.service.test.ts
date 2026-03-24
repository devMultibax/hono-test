import { describe, it, expect, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { SectionService } from '../../../src/services/section.service'
import { NotFoundError, ConflictError } from '../../../src/lib/errors'
import { Status } from '../../../src/types'
import { mockSection, mockDepartment, createMockSections } from '../../mocks/data.mock'

describe('SectionService', () => {
  beforeEach(() => {
    Object.values(mockPrisma).forEach((model) => {
      if (typeof model === 'object' && model !== null) {
        Object.values(model).forEach((fn) => {
          if (typeof fn === 'function' && 'mockClear' in fn) {
            fn.mockClear()
          }
        })
      }
    })
  })

  describe('getAll', () => {
    it('should return sections with pagination', async () => {
      const mockSections = createMockSections(2).map((s) => ({
        ...s,
        createdByName: 'Admin',
        updatedByName: null,
        department: { id: 1, name: 'IT Department' }
      }))
      mockPrisma.section.findMany.mockResolvedValue(mockSections)
      mockPrisma.section.count.mockResolvedValue(10)

      const result = await SectionService.getAll({ page: 1, limit: 2 })

      expect(mockPrisma.section.findMany).toHaveBeenCalled()
      expect(mockPrisma.section.count).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
    })

    it('should filter sections by departmentId', async () => {
      mockPrisma.section.findMany.mockResolvedValue([{
        ...mockSection,
        createdByName: 'Admin',
        updatedByName: null,
        department: { id: 1, name: 'IT Department' }
      }])
      mockPrisma.section.count.mockResolvedValue(1)

      await SectionService.getAll({ page: 1, limit: 10 }, { departmentId: 1 })

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departmentId: 1 }
        })
      )
    })

    it('should filter sections by search', async () => {
      mockPrisma.section.findMany.mockResolvedValue([{
        ...mockSection,
        createdByName: 'Admin',
        updatedByName: null,
        department: { id: 1, name: 'IT Department' }
      }])
      mockPrisma.section.count.mockResolvedValue(1)

      await SectionService.getAll({ page: 1, limit: 10 }, { search: 'Dev' })

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'Dev', mode: 'insensitive' } }
        })
      )
    })
  })

  describe('getById', () => {
    it('should return section by id', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(mockSection)

      const result = await SectionService.getById(1)

      expect(result.id).toBe(1)
      expect(result.name).toBe('Development')
    })

    it('should throw NotFoundError when section not found', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(null)

      await expect(SectionService.getById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should create a new section', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment)
      mockPrisma.section.findFirst.mockResolvedValue(null)
      mockPrisma.section.create.mockResolvedValue(mockSection)

      const result = await SectionService.create(1, 'Development', 'admin')

      expect(mockPrisma.section.create).toHaveBeenCalled()
      expect(result.name).toBe('Development')
    })

    it('should throw NotFoundError when department not found', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null)

      await expect(
        SectionService.create(999, 'Development', 'admin')
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError when section name already exists in department', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment)
      mockPrisma.section.findFirst.mockResolvedValue(mockSection)

      await expect(
        SectionService.create(1, 'Development', 'admin')
      ).rejects.toThrow(ConflictError)
    })
  })

  describe('update', () => {
    it('should update section name', async () => {
      const updatedSection = { ...mockSection, name: 'Updated Section' }
      mockPrisma.section.findFirst.mockResolvedValue(null)
      mockPrisma.section.update.mockResolvedValue(updatedSection)

      const result = await SectionService.update(
        1,
        { name: 'Updated Section' },
        'admin'
      )

      expect(result.name).toBe('Updated Section')
    })

    it('should update section status', async () => {
      const updatedSection = { ...mockSection, status: 'inactive' }
      mockPrisma.section.update.mockResolvedValue(updatedSection)

      const result = await SectionService.update(
        1,
        { status: 'inactive' },
        'admin'
      )

      expect(result.status).toBe(Status.INACTIVE)
    })

    it('should throw ConflictError when new name already exists in department', async () => {
      const existingSection = { ...mockSection, id: 2 }
      mockPrisma.section.findFirst.mockResolvedValue(existingSection)

      await expect(
        SectionService.update(1, { name: 'Existing Name' }, 'admin')
      ).rejects.toThrow(ConflictError)
    })

    it('should throw NotFoundError when section not found', async () => {
      mockPrisma.section.findFirst.mockResolvedValue(null)
      mockPrisma.section.update.mockRejectedValue(new Error('Not found'))

      await expect(
        SectionService.update(999, { name: 'New Name' }, 'admin')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete section', async () => {
      mockPrisma.section.findUnique.mockResolvedValue({
        ...mockSection,
        _count: { userDepartments: 0 }
      })
      mockPrisma.section.delete.mockResolvedValue(mockSection)

      await expect(SectionService.delete(1)).resolves.toBeUndefined()
    })

    it('should throw NotFoundError when section not found', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(null)

      await expect(SectionService.delete(999)).rejects.toThrow(NotFoundError)
    })
  })
})

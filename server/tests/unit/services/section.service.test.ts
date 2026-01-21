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
    it('should return all sections without relations', async () => {
      const mockSections = createMockSections(3)
      mockPrisma.section.findMany.mockResolvedValue(mockSections)

      const result = await SectionService.getAll()

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith({
        where: {},
        include: undefined,
        orderBy: { createdAt: 'desc' }
      })
      expect(result).toHaveLength(3)
    })

    it('should return sections with pagination', async () => {
      const mockSections = createMockSections(2)
      mockPrisma.section.findMany.mockResolvedValue(mockSections)
      mockPrisma.section.count.mockResolvedValue(10)

      const result = await SectionService.getAll(false, { page: 1, limit: 2 })

      expect(mockPrisma.section.findMany).toHaveBeenCalled()
      expect(mockPrisma.section.count).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
    })

    it('should filter sections by departmentId', async () => {
      mockPrisma.section.findMany.mockResolvedValue([mockSection])

      await SectionService.getAll(false, undefined, { departmentId: 1 })

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { departmentId: 1 }
        })
      )
    })

    it('should filter sections by search', async () => {
      mockPrisma.section.findMany.mockResolvedValue([mockSection])

      await SectionService.getAll(false, undefined, { search: 'Dev' })

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

      expect(mockPrisma.section.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: undefined
      })
      expect(result.id).toBe(1)
      expect(result.name).toBe('Development')
    })

    it('should throw NotFoundError when section not found', async () => {
      mockPrisma.section.findUnique.mockResolvedValue(null)

      await expect(SectionService.getById(999)).rejects.toThrow(NotFoundError)
    })

    it('should return section with relations when requested', async () => {
      const sectionWithRelations = {
        ...mockSection,
        department: mockDepartment,
        users: []
      }
      mockPrisma.section.findUnique.mockResolvedValue(sectionWithRelations)

      const result = await SectionService.getById(1, true)

      expect(mockPrisma.section.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            department: expect.any(Object),
            users: expect.any(Object)
          })
        })
      )
      expect(result).toHaveProperty('department')
      expect(result).toHaveProperty('users')
    })
  })

  describe('getByDepartment', () => {
    it('should return sections by department id', async () => {
      const mockSections = createMockSections(3, 1)
      mockPrisma.section.findMany.mockResolvedValue(mockSections)

      const result = await SectionService.getByDepartment(1)

      expect(mockPrisma.section.findMany).toHaveBeenCalledWith({
        where: { departmentId: 1 },
        orderBy: { name: 'asc' }
      })
      expect(result).toHaveLength(3)
    })
  })

  describe('create', () => {
    it('should create a new section', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment)
      mockPrisma.section.findFirst.mockResolvedValue(null)
      mockPrisma.section.create.mockResolvedValue(mockSection)

      const result = await SectionService.create(1, 'Development', 'admin')

      expect(mockPrisma.department.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      })
      expect(mockPrisma.section.create).toHaveBeenCalledWith({
        data: {
          departmentId: 1,
          name: 'Development',
          createdBy: 'admin'
        }
      })
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

      expect(mockPrisma.section.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Section',
          updatedBy: 'admin'
        }
      })
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

    it('should throw NotFoundError when updating department that does not exist', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null)

      await expect(
        SectionService.update(1, { departmentId: 999 }, 'admin')
      ).rejects.toThrow(NotFoundError)
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
      mockPrisma.section.delete.mockResolvedValue(mockSection)

      await expect(SectionService.delete(1)).resolves.toBeUndefined()

      expect(mockPrisma.section.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })

    it('should throw NotFoundError when section not found or has relations', async () => {
      mockPrisma.section.delete.mockRejectedValue(new Error('Not found'))

      await expect(SectionService.delete(999)).rejects.toThrow(NotFoundError)
    })
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { DepartmentService } from '../../../src/services/department.service'
import { NotFoundError, ConflictError } from '../../../src/lib/errors'
import { Status } from '../../../src/types'
import { mockDepartment, createMockDepartments } from '../../mocks/data.mock'

describe('DepartmentService', () => {
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
    it('should return all departments without relations', async () => {
      const mockDepts = createMockDepartments(3)
      mockPrisma.department.findMany.mockResolvedValue(mockDepts)

      const result = await DepartmentService.getAll()

      expect(mockPrisma.department.findMany).toHaveBeenCalledWith({
        where: {},
        include: undefined,
        orderBy: { createdAt: 'desc' }
      })
      expect(result).toHaveLength(3)
    })

    it('should return departments with pagination', async () => {
      const mockDepts = createMockDepartments(2)
      mockPrisma.department.findMany.mockResolvedValue(mockDepts)
      mockPrisma.department.count.mockResolvedValue(10)

      const result = await DepartmentService.getAll(false, { page: 1, limit: 2 })

      expect(mockPrisma.department.findMany).toHaveBeenCalled()
      expect(mockPrisma.department.count).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
    })

    it('should filter departments by search', async () => {
      mockPrisma.department.findMany.mockResolvedValue([mockDepartment])

      await DepartmentService.getAll(false, undefined, { search: 'IT' })

      expect(mockPrisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: { contains: 'IT', mode: 'insensitive' } }
        })
      )
    })

    it('should filter departments by status', async () => {
      mockPrisma.department.findMany.mockResolvedValue([mockDepartment])

      await DepartmentService.getAll(false, undefined, { status: 'active' })

      expect(mockPrisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'active' }
        })
      )
    })
  })

  describe('getById', () => {
    it('should return department by id', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment)

      const result = await DepartmentService.getById(1)

      expect(mockPrisma.department.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: undefined
      })
      expect(result.id).toBe(1)
      expect(result.name).toBe('IT Department')
    })

    it('should throw NotFoundError when department not found', async () => {
      mockPrisma.department.findUnique.mockResolvedValue(null)

      await expect(DepartmentService.getById(999)).rejects.toThrow(NotFoundError)
    })

    it('should return department with relations when requested', async () => {
      const deptWithRelations = {
        ...mockDepartment,
        sections: [],
        users: []
      }
      mockPrisma.department.findUnique.mockResolvedValue(deptWithRelations)

      const result = await DepartmentService.getById(1, true)

      expect(mockPrisma.department.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            sections: expect.any(Object),
            users: expect.any(Object)
          })
        })
      )
      expect(result).toHaveProperty('sections')
      expect(result).toHaveProperty('users')
    })
  })

  describe('create', () => {
    it('should create a new department', async () => {
      mockPrisma.department.findFirst.mockResolvedValue(null)
      mockPrisma.department.create.mockResolvedValue(mockDepartment)

      const result = await DepartmentService.create('IT Department', 'admin')

      expect(mockPrisma.department.findFirst).toHaveBeenCalledWith({
        where: { name: 'IT Department' }
      })
      expect(mockPrisma.department.create).toHaveBeenCalledWith({
        data: {
          name: 'IT Department',
          createdBy: 'admin'
        }
      })
      expect(result.name).toBe('IT Department')
    })

    it('should throw ConflictError when name already exists', async () => {
      mockPrisma.department.findFirst.mockResolvedValue(mockDepartment)

      await expect(
        DepartmentService.create('IT Department', 'admin')
      ).rejects.toThrow(ConflictError)
    })
  })

  describe('update', () => {
    it('should update department name', async () => {
      const updatedDept = { ...mockDepartment, name: 'Updated Department' }
      mockPrisma.department.findFirst.mockResolvedValue(null)
      mockPrisma.department.update.mockResolvedValue(updatedDept)

      const result = await DepartmentService.update(
        1,
        { name: 'Updated Department' },
        'admin'
      )

      expect(mockPrisma.department.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Updated Department',
          updatedBy: 'admin'
        }
      })
      expect(result.name).toBe('Updated Department')
    })

    it('should update department status', async () => {
      const updatedDept = { ...mockDepartment, status: 'inactive' }
      mockPrisma.department.update.mockResolvedValue(updatedDept)

      const result = await DepartmentService.update(
        1,
        { status: 'inactive' },
        'admin'
      )

      expect(result.status).toBe(Status.INACTIVE)
    })

    it('should throw ConflictError when new name already exists', async () => {
      const existingDept = { ...mockDepartment, id: 2 }
      mockPrisma.department.findFirst.mockResolvedValue(existingDept)

      await expect(
        DepartmentService.update(1, { name: 'Existing Name' }, 'admin')
      ).rejects.toThrow(ConflictError)
    })

    it('should throw NotFoundError when department not found', async () => {
      mockPrisma.department.findFirst.mockResolvedValue(null)
      mockPrisma.department.update.mockRejectedValue(new Error('Not found'))

      await expect(
        DepartmentService.update(999, { name: 'New Name' }, 'admin')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete department', async () => {
      mockPrisma.department.delete.mockResolvedValue(mockDepartment)

      await expect(DepartmentService.delete(1)).resolves.toBeUndefined()

      expect(mockPrisma.department.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
    })

    it('should throw NotFoundError when department not found or has relations', async () => {
      mockPrisma.department.delete.mockRejectedValue(new Error('Not found'))

      await expect(DepartmentService.delete(999)).rejects.toThrow(NotFoundError)
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockPrisma } from '../../mocks/prisma.mock'
import { ChangelogService } from '../../../src/services/changelog.service'
import { NotFoundError } from '../../../src/lib/errors'
import { mockChangelog, createMockChangelogs } from '../../mocks/data.mock'

vi.mock('../../../src/utils/audit.utils', () => ({
  getUserFullName: vi.fn().mockResolvedValue('Admin User'),
}))

describe('ChangelogService', () => {
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
    it('should return changelogs with pagination', async () => {
      const mockLogs = createMockChangelogs(3)
      mockPrisma.changelog.findMany.mockResolvedValue(mockLogs)
      mockPrisma.changelog.count.mockResolvedValue(3)

      const result = await ChangelogService.getAll({ page: 1, limit: 10 })

      expect(mockPrisma.changelog.findMany).toHaveBeenCalled()
      expect(mockPrisma.changelog.count).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
      expect(result.data).toHaveLength(3)
    })

    it('should filter by search', async () => {
      mockPrisma.changelog.findMany.mockResolvedValue([mockChangelog])
      mockPrisma.changelog.count.mockResolvedValue(1)

      await ChangelogService.getAll({ page: 1, limit: 10 }, { search: 'Initial' })

      expect(mockPrisma.changelog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'Initial', mode: 'insensitive' },
          }),
        })
      )
    })

    it('should filter by updateType', async () => {
      mockPrisma.changelog.findMany.mockResolvedValue([mockChangelog])
      mockPrisma.changelog.count.mockResolvedValue(1)

      await ChangelogService.getAll({ page: 1, limit: 10 }, { updateType: 'FEATURE' })

      expect(mockPrisma.changelog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            updateType: 'FEATURE',
          }),
        })
      )
    })

    it('should filter by date range', async () => {
      mockPrisma.changelog.findMany.mockResolvedValue([mockChangelog])
      mockPrisma.changelog.count.mockResolvedValue(1)

      await ChangelogService.getAll(
        { page: 1, limit: 10 },
        { startDate: '2024-01-01', endDate: '2024-12-31' }
      )

      expect(mockPrisma.changelog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            updatedDate: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        })
      )
    })
  })

  describe('getById', () => {
    it('should return changelog by id', async () => {
      mockPrisma.changelog.findUnique.mockResolvedValue(mockChangelog)

      const result = await ChangelogService.getById(1)

      expect(mockPrisma.changelog.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(result.id).toBe(1)
      expect(result.title).toBe('Initial Release')
    })

    it('should throw NotFoundError when not found', async () => {
      mockPrisma.changelog.findUnique.mockResolvedValue(null)

      await expect(ChangelogService.getById(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('create', () => {
    it('should create a new changelog', async () => {
      mockPrisma.changelog.create.mockResolvedValue(mockChangelog)

      const result = await ChangelogService.create(
        {
          title: 'Initial Release',
          description: 'First release',
          updateType: 'FEATURE',
          updatedDate: '2024-01-15',
        },
        'admin'
      )

      expect(mockPrisma.changelog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Initial Release',
          description: 'First release',
          updateType: 'FEATURE',
          updatedDate: new Date('2024-01-15'),
          createdBy: 'admin',
          createdByName: 'Admin User',
        }),
      })
      expect(result.title).toBe('Initial Release')
    })
  })

  describe('update', () => {
    it('should update an existing changelog', async () => {
      const updatedLog = { ...mockChangelog, title: 'Updated Title' }
      mockPrisma.changelog.findUnique.mockResolvedValue(mockChangelog)
      mockPrisma.changelog.update.mockResolvedValue(updatedLog)

      const result = await ChangelogService.update(
        1,
        { title: 'Updated Title' },
        'admin'
      )

      expect(mockPrisma.changelog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          title: 'Updated Title',
          updatedBy: 'admin',
          updatedByName: 'Admin User',
        }),
      })
      expect(result.title).toBe('Updated Title')
    })

    it('should throw NotFoundError when changelog not found', async () => {
      mockPrisma.changelog.findUnique.mockResolvedValue(null)

      await expect(
        ChangelogService.update(999, { title: 'New Title' }, 'admin')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete a changelog', async () => {
      mockPrisma.changelog.findUnique.mockResolvedValue(mockChangelog)
      mockPrisma.changelog.delete.mockResolvedValue(mockChangelog)

      await expect(ChangelogService.delete(1)).resolves.toBeUndefined()

      expect(mockPrisma.changelog.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should throw NotFoundError when changelog not found', async () => {
      mockPrisma.changelog.findUnique.mockResolvedValue(null)

      await expect(ChangelogService.delete(999)).rejects.toThrow(NotFoundError)
    })
  })
})

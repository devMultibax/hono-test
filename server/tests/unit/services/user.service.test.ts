import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { mockPrisma } from '../../mocks/prisma.mock'
import { UserService } from '../../../src/services/user.service'
import { NotFoundError } from '../../../src/lib/errors'
import { Role } from '../../../src/types'
import { mockUser, mockDepartment, mockSection, createMockUsers } from '../../mocks/data.mock'

vi.mock('bcryptjs')

describe('UserService', () => {
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
    vi.mocked(bcrypt.hash).mockResolvedValue('$2a$10$hashedpassword' as never)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
  })

  describe('getAll', () => {
    it('should return all users without relations', async () => {
      const mockUsers = createMockUsers(3)
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      const result = await UserService.getAll()

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        include: undefined,
        orderBy: { createdAt: 'desc' }
      })
      expect(result).toHaveLength(3)
    })

    it('should return users with pagination', async () => {
      const mockUsers = createMockUsers(2)
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(10)

      const result = await UserService.getAll(false, { page: 1, limit: 2 })

      expect(mockPrisma.user.findMany).toHaveBeenCalled()
      expect(mockPrisma.user.count).toHaveBeenCalled()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('pagination')
    })

    it('should filter users by search', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser])

      await UserService.getAll(false, undefined, { search: 'test' })

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ username: { contains: 'test', mode: 'insensitive' } })
            ])
          })
        })
      )
    })

    it('should filter users by departmentId', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser])

      await UserService.getAll(false, undefined, { departmentId: 1 })

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departmentId: 1 })
        })
      )
    })

    it('should filter users by role', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser])

      await UserService.getAll(false, undefined, { role: Role.ADMIN })

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: Role.ADMIN })
        })
      )
    })
  })

  describe('getById', () => {
    it('should return user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await UserService.getById(1)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: undefined
      })
      expect(result.id).toBe(1)
      expect(result.username).toBe('testuser')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.getById(999)).rejects.toThrow(NotFoundError)
    })

    it('should return user with relations when requested', async () => {
      const userWithRelations = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }
      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations)

      const result = await UserService.getById(1, true)

      expect(result).toHaveProperty('department')
      expect(result).toHaveProperty('section')
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const userWithRelations = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment)
      mockPrisma.section.findUnique.mockResolvedValue(mockSection)
      mockPrisma.user.create.mockResolvedValue(userWithRelations)
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      const result = await UserService.create(
        'testuser',
        'password123',
        'Test',
        'User',
        1,
        1,
        'test@example.com',
        '0812345678',
        Role.USER,
        'admin'
      )

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            departmentId: 1,
            role: Role.USER,
            createdBy: 'admin'
          })
        })
      )
      expect(result.username).toBe('testuser')
    })

    it('should throw Error when username already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      await expect(
        UserService.create(
          'testuser', 'password', 'Test', 'User', 1, null, null, null, Role.USER, 'admin'
        )
      ).rejects.toThrow('Username already exists')
    })

    it('should throw NotFoundError when department not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.department.findUnique.mockResolvedValue(null)

      await expect(
        UserService.create(
          'newuser', 'password', 'New', 'User', 999, null, null, null, Role.USER, 'admin'
        )
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when section not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.department.findUnique.mockResolvedValue(mockDepartment)
      mockPrisma.section.findUnique.mockResolvedValue(null)

      await expect(
        UserService.create(
          'newuser', 'password', 'New', 'User', 1, 999, null, null, Role.USER, 'admin'
        )
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      const existingUser = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }
      const updatedUser = {
        ...existingUser,
        firstName: 'Updated'
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(updatedUser)
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      const result = await UserService.update(1, { firstName: 'Updated' }, 'admin')

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            firstName: 'Updated',
            updatedBy: 'admin'
          })
        })
      )
      expect(result.firstName).toBe('Updated')
    })

    it('should hash password when updating', async () => {
      const existingUser = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.user.update.mockResolvedValue(existingUser)
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      await UserService.update(1, { password: 'newpassword' }, 'admin')

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10)
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        UserService.update(999, { firstName: 'Updated' }, 'admin')
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw NotFoundError when new department not found', async () => {
      const existingUser = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }

      mockPrisma.user.findUnique.mockResolvedValue(existingUser)
      mockPrisma.department.findUnique.mockResolvedValue(null)

      await expect(
        UserService.update(1, { departmentId: 999 }, 'admin')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete user', async () => {
      const userWithRelations = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }

      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations)
      mockPrisma.userLog.create.mockResolvedValue({} as any)
      mockPrisma.user.delete.mockResolvedValue(mockUser)

      await expect(UserService.delete(1)).resolves.toBeUndefined()

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.delete(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('verifyPassword', () => {
    it('should return true when password is correct', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const result = await UserService.verifyPassword(1, 'password123')

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password)
      expect(result).toBe(true)
    })

    it('should return false when password is incorrect', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      const result = await UserService.verifyPassword(1, 'wrongpassword')

      expect(result).toBe(false)
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(UserService.verifyPassword(999, 'password')).rejects.toThrow(NotFoundError)
    })
  })

  describe('resetPassword', () => {
    it('should reset password and set isDefaultPassword to true', async () => {
      const updatedUser = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection,
        isDefaultPassword: true
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.user.update.mockResolvedValue(updatedUser)
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      await UserService.resetPassword(1, 'newpassword', 'admin')

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10)
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDefaultPassword: true,
            tokenVersion: { increment: 1 }
          })
        })
      )
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        UserService.resetPassword(999, 'newpassword', 'admin')
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('changePassword', () => {
    it('should change password when current password is correct', async () => {
      const userWithRelations = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }

      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations)
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
      mockPrisma.user.update.mockResolvedValue(userWithRelations)
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      await UserService.changePassword(1, 'oldpassword', 'newpassword')

      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', mockUser.password)
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10)
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDefaultPassword: false
          })
        })
      )
    })

    it('should throw error when current password is incorrect', async () => {
      const userWithRelations = {
        ...mockUser,
        department: mockDepartment,
        section: mockSection
      }

      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        UserService.changePassword(1, 'wrongpassword', 'newpassword')
      ).rejects.toThrow('Current password is incorrect')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        UserService.changePassword(999, 'oldpassword', 'newpassword')
      ).rejects.toThrow(NotFoundError)
    })
  })
})

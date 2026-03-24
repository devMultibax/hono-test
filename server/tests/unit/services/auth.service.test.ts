import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { mockPrisma } from '../../mocks/prisma.mock'
import { AuthService } from '../../../src/services/auth.service'
import { UnauthorizedError, NotFoundError } from '../../../src/lib/errors'
import { Role } from '../../../src/types'
import { mockUser } from '../../mocks/data.mock'

vi.mock('bcryptjs')
vi.mock('jsonwebtoken')

const mockDepartmentsRelation = [
  {
    departmentId: 1,
    sectionId: 1,
    isPrimary: true,
    department: { id: 1, name: 'IT Department' },
    section: { id: 1, name: 'Development' }
  }
]

describe('AuthService', () => {
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
    vi.mocked(jwt.sign).mockReturnValue('mock.jwt.token' as never)
    vi.mocked(jwt.verify).mockReturnValue({
      id: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: Role.USER,
      tokenVersion: 0
    } as never)
  })

  describe('login', () => {
    it('should login successfully and return token', async () => {
      const userWithRelations = {
        ...mockUser,
        tokenVersion: 0,
        isDefaultPassword: false,
        createdByName: 'Admin User',
        updatedByName: null,
        departments: mockDepartmentsRelation
      }

      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations)
      mockPrisma.user.update.mockResolvedValue({ ...userWithRelations, tokenVersion: 1 })
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      const result = await AuthService.login('testuser', 'password123')

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password)
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          username: 'testuser',
          role: Role.USER
        }),
        expect.any(String),
        expect.any(Object)
      )
      expect(result.token).toBe('mock.jwt.token')
      expect(result.user.username).toBe('testuser')
    })

    it('should throw UnauthorizedError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        AuthService.login('nonexistent', 'password')
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError when password is wrong', async () => {
      const userWithRelations = {
        ...mockUser,
        tokenVersion: 0,
        isDefaultPassword: false,
        createdByName: 'Admin User',
        updatedByName: null,
        departments: mockDepartmentsRelation
      }

      mockPrisma.user.findUnique.mockResolvedValue(userWithRelations)
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

      await expect(
        AuthService.login('testuser', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError when account is inactive', async () => {
      const inactiveUser = {
        ...mockUser,
        status: 'inactive',
        tokenVersion: 0,
        isDefaultPassword: false,
        createdByName: 'Admin User',
        updatedByName: null,
        departments: mockDepartmentsRelation
      }

      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser)

      await expect(
        AuthService.login('testuser', 'password123')
      ).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        tokenVersion: 0,
        status: 'active'
      } as any)

      const result = await AuthService.verifyToken('valid.jwt.token')

      expect(jwt.verify).toHaveBeenCalled()
      expect(result.username).toBe('testuser')
    })

    it('should throw UnauthorizedError for invalid token', async () => {
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      await expect(
        AuthService.verifyToken('invalid.token')
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError when token version mismatch', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        tokenVersion: 1,
        status: 'active'
      } as any)

      await expect(
        AuthService.verifyToken('valid.jwt.token')
      ).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('logout', () => {
    it('should increment token version on logout', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUser)

      await AuthService.logout(1)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { tokenVersion: { increment: 1 } }
      })
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        tel: '0812345678',
        role: 'USER',
        status: 'active',
        createdAt: new Date(),
        createdBy: 'admin',
        createdByName: 'Admin User',
        updatedAt: null,
        updatedBy: null,
        updatedByName: null,
        lastLoginAt: null,
        isDefaultPassword: false,
        departments: mockDepartmentsRelation
      }

      mockPrisma.user.findUnique.mockResolvedValue(user as any)

      const result = await AuthService.getCurrentUser(1)

      expect(result.username).toBe('testuser')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(AuthService.getCurrentUser(999)).rejects.toThrow(NotFoundError)
    })
  })

  describe('updateProfile', () => {
    it('should update profile', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        tel: '0812345678',
        role: 'USER',
        status: 'active',
        createdAt: new Date(),
        createdBy: 'admin',
        createdByName: 'Admin User',
        updatedAt: null,
        updatedBy: null,
        updatedByName: null,
        lastLoginAt: null,
        isDefaultPassword: false,
        departments: mockDepartmentsRelation
      }

      mockPrisma.user.findUnique.mockResolvedValue(user as any)
      mockPrisma.user.findFirst.mockResolvedValue(null)
      mockPrisma.user.update.mockResolvedValue({
        ...user,
        firstName: 'Updated',
        email: 'updated@example.com'
      } as any)
      mockPrisma.userLog.create.mockResolvedValue({} as any)

      const result = await AuthService.updateProfile(1, {
        firstName: 'Updated',
        email: 'updated@example.com'
      })

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            firstName: 'Updated',
            email: 'updated@example.com'
          })
        })
      )
      expect(result.firstName).toBe('Updated')
    })

    it('should throw NotFoundError when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        AuthService.updateProfile(999, { firstName: 'Updated' })
      ).rejects.toThrow(NotFoundError)
    })
  })
})

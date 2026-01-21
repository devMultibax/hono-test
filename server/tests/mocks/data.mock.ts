import { Role, Status, ActionType } from '../../src/types'
import type {
  User,
  UserResponse,
  UserWithRelations,
  Department,
  DepartmentResponse,
  DepartmentWithRelations,
  Section,
  SectionResponse,
  SectionWithRelations,
  AuthPayload,
  UserLog
} from '../../src/types'

export const mockDepartment: Department = {
  id: 1,
  name: 'IT Department',
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  createdBy: 'admin',
  updatedAt: null,
  updatedBy: null
}

export const mockDepartmentResponse: DepartmentResponse = {
  id: 1,
  name: 'IT Department',
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  updatedAt: null
}

export const mockSection: Section = {
  id: 1,
  departmentId: 1,
  name: 'Development',
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  createdBy: 'admin',
  updatedAt: null,
  updatedBy: null
}

export const mockSectionResponse: SectionResponse = {
  id: 1,
  departmentId: 1,
  name: 'Development',
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  updatedAt: null
}

export const mockUser: User = {
  id: 1,
  username: 'testuser',
  password: '$2a$10$hashedpassword',
  firstName: 'Test',
  lastName: 'User',
  departmentId: 1,
  sectionId: 1,
  email: 'test@example.com',
  tel: '0812345678',
  role: Role.USER,
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  createdBy: 'admin',
  updatedAt: null,
  updatedBy: null,
  lastLoginAt: null
}

export const mockUserResponse: UserResponse = {
  id: 1,
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  departmentId: 1,
  sectionId: 1,
  email: 'test@example.com',
  tel: '0812345678',
  role: Role.USER,
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  lastLoginAt: null
}

export const mockUserWithRelations: UserWithRelations = {
  ...mockUserResponse,
  department: mockDepartmentResponse,
  section: mockSectionResponse
}

export const mockAdminUser: User = {
  ...mockUser,
  id: 2,
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  role: Role.ADMIN,
  email: 'admin@example.com'
}

export const mockAuthPayload: AuthPayload = {
  id: 1,
  username: 'testuser',
  role: Role.USER,
  tokenVersion: 0
}

export const mockAdminAuthPayload: AuthPayload = {
  id: 2,
  username: 'admin',
  role: Role.ADMIN,
  tokenVersion: 0
}

export const mockUserLog: UserLog = {
  id: 1,
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  department: 'IT Department',
  section: 'Development',
  email: 'test@example.com',
  tel: '0812345678',
  role: Role.USER,
  status: Status.ACTIVE,
  createdAt: new Date('2024-01-01'),
  createdBy: 'admin',
  updatedAt: null,
  updatedBy: null,
  actionType: ActionType.CREATE,
  actionAt: new Date('2024-01-01')
}

export const mockDepartmentWithRelations: DepartmentWithRelations = {
  ...mockDepartmentResponse,
  sections: [mockSectionResponse],
  users: [mockUserResponse]
}

export const mockSectionWithRelations: SectionWithRelations = {
  ...mockSectionResponse,
  department: mockDepartmentResponse,
  users: [mockUserResponse]
}

export function createMockUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockUser,
    id: i + 1,
    username: `user${i + 1}`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    email: `user${i + 1}@example.com`
  }))
}

export function createMockDepartments(count: number): Department[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockDepartment,
    id: i + 1,
    name: `Department ${i + 1}`
  }))
}

export function createMockSections(count: number, departmentId = 1): Section[] {
  return Array.from({ length: count }, (_, i) => ({
    ...mockSection,
    id: i + 1,
    departmentId,
    name: `Section ${i + 1}`
  }))
}

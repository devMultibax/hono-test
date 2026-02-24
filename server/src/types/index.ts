// Hono Context
export type HonoContext = {
  Variables: {
    user: AuthPayload
    logInfo: (event: string, additionalData?: Record<string, unknown>) => void
    logWarn: (event: string, additionalData?: Record<string, unknown>) => void
    logError: (event: string, additionalData?: Record<string, unknown>) => void
  }
}

// Enums
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESET_PASSWORD = 'RESET_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD'
}

// Department Types
export interface Department {
  id: number
  name: string
  status: Status
  createdAt: Date
  createdBy: string
  updatedAt: Date | null
  updatedBy: string | null
}

export interface DepartmentResponse {
  id: number
  name: string
  status: Status
  createdAt: Date
  createdBy: string
  createdByName: string
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
}

export interface DepartmentWithRelations extends DepartmentResponse {
  sections?: SectionResponse[]
  users?: UserResponse[]
}

// Section Types
export interface Section {
  id: number
  departmentId: number
  name: string
  status: Status
  createdAt: Date
  createdBy: string
  updatedAt: Date | null
  updatedBy: string | null
}

export interface SectionResponse {
  id: number
  departmentId: number
  name: string
  status: Status
  createdAt: Date
  createdBy: string
  createdByName: string
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
}

export interface SectionWithRelations extends SectionResponse {
  department?: DepartmentResponse
  users?: UserResponse[]
}

// User Types
export interface User {
  id: number
  username: string
  password: string
  firstName: string
  lastName: string
  departmentId: number
  sectionId: number | null
  email: string | null
  tel: string | null
  role: Role
  status: Status
  createdAt: Date
  createdBy: string
  updatedAt: Date | null
  updatedBy: string | null
  lastLoginAt: Date | null
}

export interface UserResponse {
  id: number
  username: string
  firstName: string
  lastName: string
  departmentId: number
  sectionId: number | null
  email: string | null
  tel: string | null
  role: Role
  status: Status
  createdAt: Date
  createdBy: string
  createdByName: string
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
  lastLoginAt: Date | null
}

export interface EmbeddedRelation {
  id: number
  name: string
}

export interface UserWithRelations extends UserResponse {
  department?: EmbeddedRelation
  section?: EmbeddedRelation | null
}

// Auth Types
export interface AuthPayload {
  id: number
  username: string
  firstName: string
  lastName: string
  role: Role
  tokenVersion?: number
}

export interface LoginResponse {
  token: string
  user: UserWithRelations
  previousSessionTerminated: boolean
}

// User Log Types
export interface UserLog {
  id: number
  username: string
  firstName: string
  lastName: string
  department: string
  section: string
  email: string | null
  tel: string | null
  role: Role
  status: Status
  createdAt: Date
  createdBy: string
  createdByName: string
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
  actionType: ActionType
  actionAt: Date
}

export interface UserLogResponse {
  id: number
  username: string
  firstName: string
  lastName: string
  department: string
  section: string
  email: string | null
  tel: string | null
  role: Role
  status: Status
  createdAt: Date
  createdBy: string
  createdByName: string
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
  actionType: ActionType
  actionAt: Date
}

// System Setting Types
export interface SystemSettingResponse {
  id: number
  key: string
  value: string
  description: string | null
  updatedAt: Date | null
  updatedBy: string | null
  updatedByName: string | null
}

export interface MaintenanceStatusResponse {
  maintenance: boolean
  message: string | null
}

// Common Types
export interface ApiErrorDetail {
  code: string
  message: string
  details?: unknown
}

export interface ApiErrorResponse {
  error: ApiErrorDetail
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiPaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/** @deprecated Use ApiErrorResponse instead */
export interface ErrorResponse {
  error: string
  details?: unknown
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

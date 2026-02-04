// ============ Common Types ============
export type Status = 'active' | 'inactive';
export type Role = 'USER' | 'ADMIN';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
export type SortOrder = 'asc' | 'desc';

// ============ Pagination ============
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  users?: T[];
  departments?: T[];
  sections?: T[];
  logs?: T[];
  pagination: Pagination;
}

// ============ Query Params ============
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
  search?: string;
}

export interface UserQueryParams extends BaseQueryParams {
  departmentId?: number;
  sectionId?: number;
  role?: Role;
  status?: Status;
}

export interface DepartmentQueryParams extends BaseQueryParams {
  status?: Status;
}

export interface SectionQueryParams extends BaseQueryParams {
  departmentId?: number;
  status?: Status;
}

export interface UserLogQueryParams extends BaseQueryParams {
  username?: string;
  actionType?: ActionType;
  startDate?: string;
  endDate?: string;
}

// ============ User ============
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  sectionId: number | null;
  email: string | null;
  tel: string | null;
  role: Role;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  lastLoginAt: string | null;
  isDefaultPassword: boolean;
  department?: Department;
  section?: Section | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  sectionId?: number;
  email?: string;
  tel?: string;
  role?: Role;
  status?: Status;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  departmentId?: number;
  sectionId?: number | null;
  email?: string | null;
  tel?: string | null;
  role?: Role;
  status?: Status;
  password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  tel?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============ Department ============
export interface Department {
  id: number;
  name: string;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  sections?: Section[];
  _count?: {
    users: number;
    sections: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  status?: Status;
}

// ============ Section ============
export interface Section {
  id: number;
  departmentId: number;
  name: string;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  department?: Department;
  _count?: {
    users: number;
  };
}

export interface CreateSectionRequest {
  name: string;
  departmentId: number;
  status?: Status;
}

// ============ User Log ============
export interface UserLog {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  department: string;
  section: string;
  email: string | null;
  tel: string | null;
  role: Role;
  status: Status;
  actionType: ActionType;
  actionAt: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

// ============ Backup ============
export interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

// ============ Database ============
export interface DatabaseStats {
  databaseSize: string;
  tables: Array<{
    name: string;
    rowCount: number;
    size: string;
  }>;
}

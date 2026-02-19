// ============ Common Types ============
export type Status = 'active' | 'inactive';
export type Role = 'USER' | 'ADMIN';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET_PASSWORD' | 'CHANGE_PASSWORD';
export type SortOrder = 'asc' | 'desc';

// ============ Pagination ============
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export type UserListResponse = PaginatedResponse<User>;
export type DepartmentListResponse = PaginatedResponse<Department>;
export type SectionListResponse = PaginatedResponse<Section>;

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
  createdByName: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
  lastLoginAt: string | null;
  isDefaultPassword: boolean;
  department?: Department;
  section?: Section | null;
}

export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  sectionId?: number;
  email?: string;
  tel?: string;
  role?: Role;
  status?: Status;
}

export interface CreateUserResponse {
  user: User;
  password: string;
}

export interface ResetPasswordResponse {
  user: User;
  password: string;
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
  createdByName: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
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

export interface UpdateDepartmentRequest {
  name?: string;
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
  createdByName: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
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

export interface UpdateSectionRequest {
  name?: string;
  departmentId?: number;
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
  createdByName: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
}

// ============ Backup ============
export type BackupType = 'yearly' | 'daily' | 'manual';

export interface BackupFile {
  filename: string;
  type: BackupType;
  date: string;
  modifiedAt: string;
  restoredAt: string | null;
  size: number;
  sizeFormatted: string;
}

// ============ System Settings ============
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
}

export interface MaintenanceStatus {
  maintenance: boolean;
  message: string | null;
}

// ============ Database ============
export interface TableStat {
  tableName: string;
  rowCount: number;
  totalSize: string;
  indexSize: string;
  totalSizeBytes: number;
}

export interface DatabaseStatistics {
  databaseName: string;
  totalTables: number;
  totalRows: number;
  totalSize: string;
  tables: TableStat[];
}

export interface AnalyzeResult {
  message: string;
  analyzedTables: string[];
  timestamp: string;
}

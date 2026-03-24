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
  departmentIds?: string;
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

// ============ User Department Entry ============
export interface UserDepartmentEntry {
  departmentId: number;
  sectionId: number | null;
  isPrimary: boolean;
  department?: Department;
  section?: Section | null;
}

export interface DepartmentInput {
  departmentId: number;
  sectionId?: number;
  isPrimary: boolean;
}

// ============ User ============
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
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
  departments: UserDepartmentEntry[];
}

export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  departments: DepartmentInput[];
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
  departments?: DepartmentInput[];
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
    userDepartments: number;
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
    userDepartments: number;
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
  additionalDepartments: string | null;
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

// ============ Changelog ============
export type UpdateType = 'FEATURE' | 'BUGFIX' | 'IMPROVEMENT' | 'SECURITY' | 'OTHER';

export interface Changelog {
  id: number;
  title: string;
  description: string | null;
  updateType: UpdateType;
  gitRef: string | null;
  updatedDate: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
}

export interface CreateChangelogRequest {
  title: string;
  description?: string;
  updateType: UpdateType;
  gitRef?: string;
  updatedDate: string;
}

export interface UpdateChangelogRequest {
  title?: string;
  description?: string | null;
  updateType?: UpdateType;
  gitRef?: string | null;
  updatedDate?: string;
}

export interface ChangelogQueryParams extends BaseQueryParams {
  updateType?: UpdateType;
  startDate?: string;
  endDate?: string;
}

export type ChangelogListResponse = PaginatedResponse<Changelog>;

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

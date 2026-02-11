import type { User, CreateUserRequest, UpdateUserRequest, UserQueryParams, Role, Status } from '@/types';

// Re-export สำหรับใช้ภายใน feature
export type { User, CreateUserRequest, UpdateUserRequest, UserQueryParams, Role, Status };

// Drawer state — ใช้ร่วมกันทั้ง feature
export type UserDrawerState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'detail'; userId: number }
  | { mode: 'edit'; userId: number };

// Form values — กำหนดชัดเจนที่เดียว
export interface UserFormValues {
  username: string;
  firstName: string;
  lastName: string;
  departmentId: number | null;
  sectionId: number | null;
  email: string;
  tel: string;
  role: Role;
  status: Status;
}

// Export filter params — แยก type ให้ชัด
export interface UserExportParams {
  departmentId?: number;
  sectionId?: number;
  role?: Role;
  status?: Status;
}

import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest, DepartmentQueryParams, Status } from '@/types';

// Re-export สำหรับใช้ภายใน feature
export type { Department, CreateDepartmentRequest, UpdateDepartmentRequest, DepartmentQueryParams, Status };

// Drawer state — ใช้ร่วมกันทั้ง feature
export type DepartmentDrawerState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'detail'; departmentId: number }
  | { mode: 'edit'; departmentId: number };

// Form values — กำหนดชัดเจนที่เดียว
export interface DepartmentFormValues {
  name: string;
  status: Status;
}

// Export filter params — แยก type ให้ชัด
export interface DepartmentExportParams {
  status?: Status;
}

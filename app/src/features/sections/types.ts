import type { Section, CreateSectionRequest, UpdateSectionRequest, SectionQueryParams, Status } from '@/types';

// Re-export สำหรับใช้ภายใน feature
export type { Section, CreateSectionRequest, UpdateSectionRequest, SectionQueryParams, Status };

// Drawer state — ใช้ร่วมกันทั้ง feature
export type SectionDrawerState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'detail'; sectionId: number }
  | { mode: 'edit'; sectionId: number };

// Form values — กำหนดชัดเจนที่เดียว
export interface SectionFormValues {
  name: string;
  departmentId: number | null;
  status: Status;
}

// Export filter params — แยก type ให้ชัด
export interface SectionExportParams {
  departmentId?: number;
  status?: Status;
}

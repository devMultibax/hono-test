import { apiClient, downloadFile } from '../client';
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentListResponse,
  DepartmentQueryParams,
} from '@/types';

const buildQueryString = (params?: DepartmentQueryParams): string => {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v != null);
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
};

export const departmentApi = {
  getAll: (params: DepartmentQueryParams) =>
    apiClient.get<DepartmentListResponse>('/departments', { params }),

  getById: (id: number) =>
    apiClient.get<Department>(`/departments/${id}`, { params: { include: 'true' } }),

  create: (data: CreateDepartmentRequest) =>
    apiClient.post<Department>('/departments', data),

  update: (id: number, data: UpdateDepartmentRequest) =>
    apiClient.put<Department>(`/departments/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/departments/${id}`),

  exportExcel: (params?: DepartmentQueryParams, signal?: AbortSignal) =>
    downloadFile(`/departments/export/excel?${buildQueryString(params)}`, `departments-${Date.now()}.xlsx`, signal),

  downloadTemplate: () =>
    downloadFile('/departments/template', 'department-import-template.xlsx'),

  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/departments/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

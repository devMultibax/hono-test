import { apiClient, downloadFile } from '../client';
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentListResponse,
  DepartmentQueryParams,
} from '@/types';

export const departmentApi = {
  getAll: (params: DepartmentQueryParams) =>
    apiClient.get<DepartmentListResponse>('/departments', { params }),

  getById: (id: number) =>
    apiClient.get<{ data: Department }>(`/departments/${id}`, { params: { include: 'true' } }),

  create: (data: CreateDepartmentRequest) =>
    apiClient.post<{ data: Department }>('/departments', data),

  update: (id: number, data: UpdateDepartmentRequest) =>
    apiClient.put<{ data: Department }>(`/departments/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/departments/${id}`),

  exportExcel: (params?: DepartmentQueryParams, signal?: AbortSignal) =>
    downloadFile('/departments/export/excel', `departments-${Date.now()}.xlsx`, signal, params as Record<string, unknown>),

  downloadTemplate: () =>
    downloadFile('/departments/template', 'Department_Import_Template.xlsx'),

  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/departments/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

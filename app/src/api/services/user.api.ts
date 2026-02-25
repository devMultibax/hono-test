import { apiClient, downloadFile } from '../client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserQueryParams,
  CreateUserResponse,
  ResetPasswordResponse,
} from '@/types';

export const userApi = {
  getAll: (params: UserQueryParams) =>
    apiClient.get<UserListResponse>('/users', { params: { ...params, include: 'true' } }),

  getById: (id: number) =>
    apiClient.get<{ data: User }>(`/users/${id}`, { params: { include: 'true' } }),

  create: (data: CreateUserRequest) =>
    apiClient.post<{ data: CreateUserResponse }>('/users', data),

  update: (id: number, data: UpdateUserRequest) =>
    apiClient.put<{ data: User }>(`/users/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  verifyPassword: (password: string) =>
    apiClient.post<{ data: { valid: boolean } }>('/users/password/verify', { password }),

  resetPassword: (id: number) =>
    apiClient.patch<{ data: ResetPasswordResponse }>(`/users/${id}/password/reset`),

  exportExcel: (params?: UserQueryParams, signal?: AbortSignal) =>
    downloadFile('/users/export/excel', `users-${Date.now()}.xlsx`, signal, params as Record<string, unknown>),

  downloadTemplate: () =>
    downloadFile('/users/template', 'User_Import_Template.xlsx'),

  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

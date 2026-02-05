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

const buildQueryString = (params?: UserQueryParams): string => {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v != null);
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
};

export const userApi = {
  getAll: (params: UserQueryParams) =>
    apiClient.get<UserListResponse>('/users', { params: { ...params, include: 'true' } }),

  getById: (id: number) =>
    apiClient.get<User>(`/users/${id}`, { params: { include: 'true' } }),

  create: (data: CreateUserRequest) =>
    apiClient.post<CreateUserResponse>('/users', data),

  update: (id: number, data: UpdateUserRequest) =>
    apiClient.put<User>(`/users/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  verifyPassword: (password: string) =>
    apiClient.post<{ valid: boolean }>('/users/password/verify', { password }),

  resetPassword: (id: number) =>
    apiClient.patch<ResetPasswordResponse>(`/users/${id}/password/reset`),

  exportExcel: (params?: UserQueryParams) =>
    downloadFile(`/users/export/excel?${buildQueryString(params)}`, `users-${Date.now()}.xlsx`),

  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

import { apiClient } from '../client';
import type { User, LoginRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/types';

interface LoginResponse {
  user: User;
}

interface CsrfResponse {
  csrfToken: string;
}

export const authApi = {
  getCsrfToken: () =>
    apiClient.get<{ data: CsrfResponse }>('/auth/csrf-token'),

  login: (data: LoginRequest) =>
    apiClient.post<{ data: LoginResponse }>('/auth/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<{ data: { user: User } }>('/auth/me'),

  updateMe: (data: UpdateProfileRequest) =>
    apiClient.put<{ data: { user: User } }>('/auth/me', data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put('/auth/me/password', data),
};
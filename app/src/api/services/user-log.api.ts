import { apiClient } from '../client';
import type { PaginatedResponse, UserLog, UserLogQueryParams } from '@/types';

export const userLogApi = {
  getByUsername: (username: string, params?: Omit<UserLogQueryParams, 'username'>) =>
    apiClient.get<PaginatedResponse<UserLog>>('/user-logs', {
      params: { ...params, username },
    }),
};

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { SystemLog, SystemLogQueryParams, SystemLogListResponse } from '@/features/systemLogs/types';

export const systemLogApi = {
  getLogs: (params: SystemLogQueryParams) => {
    const queryParams: Record<string, string | number> = {};

    if (params.level && params.level !== '') {
      queryParams.level = params.level;
    }

    // Send date range to server
    if (params.startDateTime) {
      queryParams.startDate = params.startDateTime.split('T')[0];
    }
    if (params.endDateTime) {
      queryParams.endDate = params.endDateTime.split('T')[0];
    }

    queryParams.limit = 10000;

    return apiClient
      .get<SystemLogListResponse>(API_ENDPOINTS.SYSTEM_LOGS.BASE, { params: queryParams })
      .then((r) => {
        const response = r.data as SystemLogListResponse;
        return response?.data || [];
      });
  },
};

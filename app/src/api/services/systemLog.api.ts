import { apiClient } from '../client';
import type { SystemLog, SystemLogQueryParams } from '@/features/systemLogs/types';

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
      .get<{ data: SystemLog[] }>('/system-log', { params: queryParams })
      .then((r) => r.data.data ?? []);
  },
};

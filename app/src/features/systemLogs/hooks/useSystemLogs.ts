import { useQuery } from '@tanstack/react-query';
import { systemLogApi } from '@/api/services/systemLog.api';
import type { SystemLogQueryParams } from '../types';

// === Query Keys ===

export const systemLogKeys = {
  all: ['systemLogs'] as const,
  list: (params: SystemLogQueryParams) => [...systemLogKeys.all, 'list', params] as const,
};

// === Queries ===

export function useSystemLogs(params: SystemLogQueryParams, enabled = false) {
  return useQuery({
    queryKey: systemLogKeys.list(params),
    queryFn: () => systemLogApi.getLogs(params),
    enabled,
  });
}

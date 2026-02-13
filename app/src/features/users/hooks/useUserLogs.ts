import { useQuery } from '@tanstack/react-query';
import { userLogApi } from '@/api/services/user-log.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import type { UserLogQueryParams } from '@/types';

export const userLogKeys = createQueryKeys<UserLogQueryParams>('userLogs');

export function useUserLogs(username: string, params?: Omit<UserLogQueryParams, 'username'>) {
  return useQuery({
    queryKey: userLogKeys.list({ ...params, username }),
    queryFn: () => userLogApi.getByUsername(username, params).then((r) => r.data),
    enabled: !!username,
    placeholderData: (prev) => prev,
  });
}

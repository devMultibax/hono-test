import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/services/user.api';
import { Report } from '@/utils/alertUtils';
import { t } from '@/lib/i18n/helpers';
import type { UserQueryParams, UpdateUserRequest } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id).then((r) => r.data),
    enabled: id > 0,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      Report.success(t('users:message.createSuccess'));
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) => userApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({ queryKey: userKeys.detail(id) });
      Report.success(t('users:message.updateSuccess'));
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      Report.success(t('users:message.deleteSuccess'));
    },
  });
}

export function useBulkDeleteUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => userApi.delete(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      Report.success(t('users:message.bulkDeleteSuccess'));
    },
  });
}

export function useResetPassword() {
  return useMutation({ mutationFn: userApi.resetPassword });
}

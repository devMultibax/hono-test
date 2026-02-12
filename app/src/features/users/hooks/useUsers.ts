import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/services/user.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import { createCrudHooks } from '@/hooks/createCrudHooks';
import type { UserQueryParams, CreateUserRequest, UpdateUserRequest } from '../types';

export const userKeys = createQueryKeys<UserQueryParams>('users');

const { useUpdate, useDelete, useBulkDelete } = createCrudHooks<CreateUserRequest, UpdateUserRequest>({
  queryKeys: userKeys,
  api: {
    create: userApi.create,
    update: userApi.update,
    delete: userApi.delete,
  },
  messages: {
    createSuccess: 'users:message.createSuccess',
    updateSuccess: 'users:message.updateSuccess',
    deleteSuccess: 'users:message.deleteSuccess',
    bulkDeleteSuccess: 'users:message.bulkDeleteSuccess',
  },
});

export {
  useUpdate as useUpdateUser,
  useDelete as useDeleteUser,
  useBulkDelete as useBulkDeleteUsers,
};

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

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

export function useResetPassword() {
  return useMutation({ mutationFn: userApi.resetPassword });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) =>
      userApi.update(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

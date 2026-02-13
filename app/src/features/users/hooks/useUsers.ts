import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/services/user.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import { createCrudHooks } from '@/hooks/createCrudHooks';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Report } from '@/utils/mantineAlertUtils';
import type { UserQueryParams, CreateUserRequest, UpdateUserRequest, User, Status } from '../types';

// === Query Keys ===

export const userKeys = createQueryKeys<UserQueryParams>('users');

// === CRUD Mutations (factory) ===

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

// === Queries ===

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

// === Action Handlers (with confirmation dialogs) ===

export function useUserActions() {
  const { t } = useTranslation(['users']);
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const deleteUser = useDelete();
  const updateUserStatus = useUpdateUserStatus();
  const bulkDeleteUsers = useBulkDelete();

  const handleDelete = useCallback(async (user: User) => {
    const confirmed = await confirm({
      title: t('users:confirm.delete.title'),
      message: t('users:confirm.delete.user', { name: `${user.firstName} ${user.lastName}` }),
      note: t('users:confirm.irreversibleNote'),
    });
    if (!confirmed) return;

    deleteUser.mutate(user.id);
  }, [confirm, deleteUser, t]);

  const handleStatusChange = useCallback(
    async (user: User, status: Status) => {
      const confirmed = await confirm({
        title: t('users:confirm.statusChange.title'),
        message: t('users:confirm.statusChange.message', {
          name: `${user.firstName} ${user.lastName}`,
          status: t(`users:status.${status}`),
        }),
      });
      if (!confirmed) return;

      await updateUserStatus.mutateAsync({ id: user.id, status });
      Report.success(t('users:message.statusChangeSuccess'));
    },
    [confirm, updateUserStatus, t],
  );

  const handleBulkDelete = useCallback(
    async (selectedUsers: User[]) => {
      const confirmed = await confirm({
        title: t('users:confirm.bulkDelete.title'),
        message: t('users:confirm.bulkDelete.message', { count: selectedUsers.length }),
        note: t('users:confirm.irreversibleNote'),
      });
      if (!confirmed) return;

      bulkDeleteUsers.mutate(selectedUsers.map((u) => u.id));
    },
    [confirm, bulkDeleteUsers, t],
  );

  const handleImportSuccess = useCallback(
    () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    [queryClient],
  );

  return {
    handleDelete,
    handleStatusChange,
    handleBulkDelete,
    handleImportSuccess,
  };
}

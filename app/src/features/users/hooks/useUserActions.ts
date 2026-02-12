import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Report } from '@/utils/mantineAlertUtils';
import { useDeleteUser, useBulkDeleteUsers, useUpdateUserStatus, userKeys } from './useUsers';
import type { User, Status } from '../types';

export function useUserActions() {
  const { t } = useTranslation(['users']);
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const deleteUser = useDeleteUser();
  const updateUserStatus = useUpdateUserStatus();
  const bulkDeleteUsers = useBulkDeleteUsers();

  const handleDelete = useCallback((user: User) => {
    confirm({
      title: t('users:confirm.delete.title'),
      message: t('users:confirm.delete.message', { name: `${user.firstName} ${user.lastName}` }),
      onConfirm: () => deleteUser.mutate(user.id),
    });
  }, [confirm, deleteUser, t]);

  const handleStatusChange = useCallback(
    (user: User, status: Status) => {
      confirm({
        title: t('users:confirm.statusChange.title'),
        message: t('users:confirm.statusChange.message', {
          name: `${user.firstName} ${user.lastName}`,
          status: t(`users:status.${status}`),
        }),
        onConfirm: () => {
          updateUserStatus.mutate(
            { id: user.id, status },
            {
              onSuccess: () => {
                Report.success(t('users:message.statusChangeSuccess'));
              },
            }
          );
        },
      });
    },
    [confirm, updateUserStatus, t],
  );

  const handleBulkDelete = useCallback(
    (selectedUsers: User[]) => {
      confirm({
        title: t('users:confirm.bulkDelete.title'),
        message: t('users:confirm.bulkDelete.message', { count: selectedUsers.length }),
        onConfirm: () => bulkDeleteUsers.mutate(selectedUsers.map((u) => u.id)),
      });
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

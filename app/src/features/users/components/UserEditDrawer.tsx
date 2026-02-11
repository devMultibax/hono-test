import { Drawer, LoadingOverlay, Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { UserForm } from './UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import type { UpdateUserRequest } from '@/types';

interface Props {
  opened: boolean;
  onClose: () => void;
  userId: number;
}

export function UserEditDrawer({ opened, onClose, userId }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = (data: UpdateUserRequest) => {
    updateUser.mutate({ id: userId, data }, { onSuccess: onClose });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('users:page.editTitle')}
      position="right"
      size="lg"
    >
      <LoadingOverlay visible={isLoading} />

      {error || (!isLoading && !user) ? (
        <Alert icon={<AlertCircle size={16} />} color="red">
          {t('users:message.userNotFound')}
        </Alert>
      ) : user && (
        <UserForm initialData={user} onSubmit={handleSubmit} onCancel={onClose} isLoading={updateUser.isPending} />
      )}
    </Drawer>
  );
}

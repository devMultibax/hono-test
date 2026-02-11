import { DrawerForm } from '@/components/common/DrawerForm';
import { UserForm } from './UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import type { UpdateUserRequest } from '../types';

interface Props {
  opened: boolean;
  onClose: () => void;
  userId: number;
}

export function UserEditDrawer({ opened, onClose, userId }: Props) {
  const { t } = useTranslation(['users']);
  const { confirm } = useConfirm();
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = (data: UpdateUserRequest) => {
    confirm({
      title: t('users:confirm.update.title'),
      message: t('users:confirm.update.message', { name: `${user?.firstName} ${user?.lastName}` }),
      onConfirm: () => {
        updateUser.mutate({ id: userId, data }, { onSuccess: onClose });
      },
    });
  };

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('users:page.editTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('users:message.userNotFound')}
    >
      {user && (
        <UserForm initialData={user} onSubmit={handleSubmit} onCancel={onClose} isLoading={updateUser.isPending} />
      )}
    </DrawerForm>
  );
}

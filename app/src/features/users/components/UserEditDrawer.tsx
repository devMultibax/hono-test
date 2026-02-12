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
  const { confirmWarning } = useConfirm();
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = (data: UpdateUserRequest) => {
    const userName = `${user?.firstName} ${user?.lastName}`;

    confirmWarning(
      '',
      () => {
        updateUser.mutate({ id: userId, data }, { onSuccess: onClose });
      },
      {
        title: t('users:confirm.update.title'),
        message: `คุณต้องการบันทึกการแก้ไขข้อมูลผู้ใช้ "${userName}" หรือไม่?`,
      }
    );
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

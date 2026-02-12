import { useState } from 'react';
import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { useResetPassword } from '../hooks/useUsers';
import { ResetPasswordModal } from './ResetPasswordModal';
import type { User } from '@/types';

interface Props {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function UserActionMenu({ user, onEdit, onDelete, onView, canEdit, canDelete }: Props) {
  const { t } = useTranslation(['users']);
  const { confirm } = useConfirm();
  const resetPassword = useResetPassword();
  const [resetResult, setResetResult] = useState<{ username: string; password: string } | null>(null);

  const handleResetPassword = () => {
    confirm({
      title: t('users:resetPassword.title'),
      message: t('users:resetPassword.confirmMessage', { name: `${user.firstName} ${user.lastName}` }),
      onConfirm: () => {
        resetPassword.mutate(user.id, {
          onSuccess: (res) => {
            setResetResult({ username: user.username, password: res.data.password });
          },
        });
      },
    });
  };

  return (
    <>
      <Group gap={6} wrap="nowrap">
        {onView && (
          <Button variant="light" size="xs" onClick={onView}>
            {t('users:action.viewDetails')}
          </Button>
        )}

        {canEdit && (
          <>
            <Button variant="light" size="xs" color='yellow' onClick={onEdit}>
              {t('users:action.edit')}
            </Button>
            <Button variant="light" size="xs" color='violet' onClick={handleResetPassword}>
              {t('users:action.resetPassword')}
            </Button>
          </>
        )}

        {canDelete && (
          <Button variant="light" size="xs" color='red' onClick={onDelete}>
            {t('users:action.delete')}
          </Button>
        )}
      </Group>

      <ResetPasswordModal
        username={resetResult?.username ?? ''}
        password={resetResult?.password ?? ''}
        opened={!!resetResult}
        onClose={() => setResetResult(null)}
      />
    </>
  );
}

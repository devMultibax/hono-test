import { useState } from 'react';
import { Group, Button, Modal, Stack, Text, Alert } from '@mantine/core';
import { PasswordDisplay } from '@/components/common/PasswordDisplay';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { useResetPassword } from '../hooks/useUsers';
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
  const { t } = useTranslation(['users', 'common']);
  const { confirm } = useConfirm();
  const resetPassword = useResetPassword();
  const [resetResult, setResetResult] = useState<{ username: string; password: string } | null>(null);

  const handleResetPassword = () => {
    confirm({
      title: t('users:resetPassword.title'),
      message: t('users:resetPassword.confirmMessage', { name: `${user.firstName} ${user.lastName}` }),
      note: t('users:resetPassword.autoGenerate'),
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

      <Modal
        opened={!!resetResult}
        onClose={() => setResetResult(null)}
        title={t('users:resetPassword.successTitle')}
        centered
        closeOnClickOutside={false}
      >
        <Stack gap="md">
          <Alert color="green" variant="light">
            <Text size="sm">{t('users:resetPassword.saveWarning')}</Text>
          </Alert>

          <PasswordDisplay
            username={resetResult?.username ?? ''}
            password={resetResult?.password ?? ''}
            passwordLabel={t('users:resetPassword.newPassword')}
          />

          <Button onClick={() => setResetResult(null)} fullWidth>
            {t('users:resetPassword.button.close')}
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

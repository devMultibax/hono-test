import { useState } from 'react';
import { Group, Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
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
  const [resetModalOpen, setResetModalOpen] = useState(false);

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
            <Button variant="light" size="xs" color='violet' onClick={() => setResetModalOpen(true)}>
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

      <ResetPasswordModal user={user} opened={resetModalOpen} onClose={() => setResetModalOpen(false)} />
    </>
  );
}

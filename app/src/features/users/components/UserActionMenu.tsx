import { useState } from 'react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { Edit, Trash2, Key, Eye } from 'lucide-react';
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
      <Group gap={4} wrap="nowrap">
        {onView && (
          <Tooltip label={t('users:action.view')}>
            <ActionIcon variant="subtle" color="blue" onClick={onView}>
              <Eye size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {canEdit && (
          <>
            <Tooltip label={t('users:action.edit')}>
              <ActionIcon variant="subtle" color="yellow" onClick={onEdit}>
                <Edit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t('users:action.resetPassword')}>
              <ActionIcon variant="subtle" color="violet" onClick={() => setResetModalOpen(true)}>
                <Key size={16} />
              </ActionIcon>
            </Tooltip>
          </>
        )}

        {canDelete && (
          <Tooltip label={t('users:action.delete')}>
            <ActionIcon variant="subtle" color="red" onClick={onDelete}>
              <Trash2 size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <ResetPasswordModal user={user} opened={resetModalOpen} onClose={() => setResetModalOpen(false)} />
    </>
  );
}

import { useState } from 'react';
import { Menu, ActionIcon } from '@mantine/core';
import { MoreVertical, Edit, Trash2, Key, Eye } from 'lucide-react';
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
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray">
            <MoreVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {onView && (
            <Menu.Item leftSection={<Eye size={14} />} onClick={onView}>
              {t('users:action.view')}
            </Menu.Item>
          )}

          {canEdit && (
            <>
              <Menu.Item leftSection={<Edit size={14} />} onClick={onEdit}>
                {t('users:action.edit')}
              </Menu.Item>
              <Menu.Item leftSection={<Key size={14} />} onClick={() => setResetModalOpen(true)}>
                {t('users:action.resetPassword')}
              </Menu.Item>
            </>
          )}

          {canDelete && (
            <>
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                {t('users:action.delete')}
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>

      <ResetPasswordModal user={user} opened={resetModalOpen} onClose={() => setResetModalOpen(false)} />
    </>
  );
}

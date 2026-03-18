import { useState } from 'react';
import { Group, Button, Modal, Stack, Text, Alert } from '@mantine/core';
import { PasswordDisplay } from '@/components/common/PasswordDisplay';
import { useTranslation } from '@/lib/i18n';
import { ConfirmAsync } from '@/utils/mantineAlertUtils';
import { useResetPassword } from '../hooks/useUsers';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { User } from '@/types';

type Action = 'view' | 'edit' | 'viewLogs' | 'resetPassword' | 'delete';

interface ActionButtonConfig {
  action: Action;
  allowedRoles: readonly RoleId[];
  color: string;
  labelKey: string;
}

interface Props {
  user: User;
  currentUserRole: RoleId;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  onViewLogs?: () => void;
  isDeleting?: boolean;
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  {
    action: 'view',
    allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER],
    color: 'blue',
    labelKey: 'users:action.viewDetails',
  },
  {
    action: 'viewLogs',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'cyan',
    labelKey: 'users:action.viewLogs',
  },
  {
    action: 'edit',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'yellow',
    labelKey: 'users:action.edit',
  },
  {
    action: 'resetPassword',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'violet',
    labelKey: 'users:action.resetPassword',
  },
  {
    action: 'delete',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'red',
    labelKey: 'users:action.delete',
  },
];

export function UserActionMenu({ user, currentUserRole, onEdit, onDelete, onView, onViewLogs, isDeleting }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const resetPassword = useResetPassword();
  const [resetResult, setResetResult] = useState<{ username: string; password: string } | null>(null);

  const handleResetPassword = () => {
    ConfirmAsync.show({
      title: t('users:resetPassword.title'),
      message: t('users:resetPassword.confirmMessage', { name: `${user.firstName} ${user.lastName}` }),
      note: t('users:resetPassword.autoGenerate'),
      onConfirm: async () => {
        const res = await resetPassword.mutateAsync(user.id);
        setResetResult({ username: user.username, password: res.data.data?.password });
      },
    });
  };

  const actionHandlers: Record<Action, (() => void) | undefined> = {
    view: onView,
    viewLogs: onViewLogs,
    edit: onEdit,
    resetPassword: handleResetPassword,
    delete: onDelete,
  };

  const visibleButtons = ACTION_BUTTONS.filter((button) => {
    if (button.action === 'view' && !onView) return false;
    if (button.action === 'viewLogs' && !onViewLogs) return false;
    return hasRole(button.allowedRoles, currentUserRole);
  });

  if (visibleButtons.length === 0) return null;

  return (
    <>
      <Group gap={6} wrap="nowrap">
        {visibleButtons.map((button) => (
          <Button
            key={button.action}
            variant="light"
            size="xs"
            color={button.color}
            onClick={() => actionHandlers[button.action]?.()}
            loading={button.action === 'delete' && isDeleting}
            disabled={button.action === 'delete' && isDeleting}
          >
            {t(button.labelKey)}
          </Button>
        ))}
      </Group>

      <ResetPasswordModal result={resetResult} onClose={() => setResetResult(null)} />
    </>
  );
}

function ResetPasswordModal({
  result,
  onClose,
}: {
  result: { username: string; password: string } | null;
  onClose: () => void;
}) {
  const { t } = useTranslation(['users']);

  return (
    <Modal
      opened={!!result}
      onClose={onClose}
      title={t('users:resetPassword.successTitle')}
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <Alert color="green" variant="light">
          <Text size="sm">{t('users:resetPassword.saveWarning')}</Text>
        </Alert>

        <PasswordDisplay
          username={result?.username ?? ''}
          password={result?.password ?? ''}
          passwordLabel={t('users:resetPassword.newPassword')}
        />

        <Button onClick={onClose} fullWidth>
          {t('users:resetPassword.button.close')}
        </Button>
      </Stack>
    </Modal>
  );
}

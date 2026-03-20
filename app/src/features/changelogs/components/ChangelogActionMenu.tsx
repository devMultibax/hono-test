import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { Changelog } from '@/types';

type Action = 'view' | 'edit' | 'delete';

interface ActionButtonConfig {
  action: Action;
  allowedRoles: readonly RoleId[];
  color: string;
  labelKey: string;
}

interface Props {
  changelog: Changelog;
  currentUserRole: RoleId;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  {
    action: 'view',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'blue',
    labelKey: 'changelogs:action.viewDetails',
  },
  {
    action: 'edit',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'yellow',
    labelKey: 'changelogs:action.edit',
  },
  {
    action: 'delete',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'red',
    labelKey: 'changelogs:action.delete',
  },
];

export function ChangelogActionMenu({ currentUserRole, onView, onEdit, onDelete, isDeleting }: Props) {
  const { t } = useTranslation(['changelogs']);

  const actionHandlers: Record<Action, () => void> = {
    view: onView,
    edit: onEdit,
    delete: onDelete,
  };

  const visibleButtons = ACTION_BUTTONS.filter((button) =>
    hasRole(button.allowedRoles, currentUserRole),
  );

  if (visibleButtons.length === 0) return null;

  return (
    <Group gap={6} wrap="nowrap">
      {visibleButtons.map((button) => (
        <Button
          key={button.action}
          variant="light"
          size="xs"
          color={button.color}
          onClick={() => actionHandlers[button.action]()}
          loading={button.action === 'delete' && isDeleting}
          disabled={button.action === 'delete' && isDeleting}
        >
          {t(button.labelKey)}
        </Button>
      ))}
    </Group>
  );
}

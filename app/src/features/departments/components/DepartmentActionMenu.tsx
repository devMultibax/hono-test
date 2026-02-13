import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { Department } from '@/types';

type Action = 'view' | 'edit' | 'delete';

interface ActionButtonConfig {
  action: Action;
  allowedRoles: readonly RoleId[];
  color: string;
  labelKey: string;
}

interface Props {
  department: Department;
  currentUserRole: RoleId;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  {
    action: 'view',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'blue',
    labelKey: 'departments:action.viewDetails',
  },
  {
    action: 'edit',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'yellow',
    labelKey: 'departments:action.edit',
  },
  {
    action: 'delete',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'red',
    labelKey: 'departments:action.delete',
  },
];

export function DepartmentActionMenu({ currentUserRole, onView, onEdit, onDelete }: Props) {
  const { t } = useTranslation(['departments']);

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
        >
          {t(button.labelKey)}
        </Button>
      ))}
    </Group>
  );
}

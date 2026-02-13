import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { Section } from '@/types';

type Action = 'view' | 'edit' | 'delete';

interface ActionButtonConfig {
  action: Action;
  allowedRoles: readonly RoleId[];
  color: string;
  labelKey: string;
}

interface Props {
  section: Section;
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
    labelKey: 'sections:action.viewDetails',
  },
  {
    action: 'edit',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'yellow',
    labelKey: 'sections:action.edit',
  },
  {
    action: 'delete',
    allowedRoles: [ROLE_ID.ADMIN],
    color: 'red',
    labelKey: 'sections:action.delete',
  },
];

export function SectionActionMenu({ currentUserRole, onView, onEdit, onDelete }: Props) {
  const { t } = useTranslation(['sections']);

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

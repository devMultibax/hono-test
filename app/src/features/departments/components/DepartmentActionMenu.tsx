import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { useDepartmentPermissions } from '../hooks/useDepartmentPermissions';
import type { Department } from '@/types';

type Action = 'view' | 'edit' | 'delete';

interface ActionButtonConfig {
  action: Action;
  color: string;
  labelKey: string;
}

interface Props {
  department: Department;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  { action: 'view',   color: 'blue',   labelKey: 'departments:action.viewDetails' },
  { action: 'edit',   color: 'yellow', labelKey: 'departments:action.edit' },
  { action: 'delete', color: 'red',    labelKey: 'departments:action.delete' },
];

export function DepartmentActionMenu({ onView, onEdit, onDelete, isDeleting }: Props) {
  const { t } = useTranslation(['departments']);
  const { canView, canEdit, canDelete } = useDepartmentPermissions();

  const actionHandlers: Record<Action, () => void> = {
    view: onView,
    edit: onEdit,
    delete: onDelete,
  };

  const visibilityMap: Record<Action, boolean> = {
    view:   canView,
    edit:   canEdit,
    delete: canDelete,
  };

  const visibleButtons = ACTION_BUTTONS.filter((b) => visibilityMap[b.action]);

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
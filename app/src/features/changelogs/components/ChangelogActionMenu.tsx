import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { useChangelogPermissions } from '../hooks/useChangelogPermissions';
import type { Changelog } from '@/types';

type Action = 'view' | 'edit' | 'delete';

interface ActionButtonConfig {
  action: Action;
  color: string;
  labelKey: string;
}

interface Props {
  changelog: Changelog;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  { action: 'view',   color: 'blue',   labelKey: 'changelogs:action.viewDetails' },
  { action: 'edit',   color: 'yellow', labelKey: 'changelogs:action.edit' },
  { action: 'delete', color: 'red',    labelKey: 'changelogs:action.delete' },
];

export function ChangelogActionMenu({ onView, onEdit, onDelete, isDeleting }: Props) {
  const { t } = useTranslation(['changelogs']);
  const { canView, canEdit, canDelete } = useChangelogPermissions();

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
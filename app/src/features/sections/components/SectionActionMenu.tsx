import { Group, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { useSectionPermissions } from '../hooks/useSectionPermissions';
import type { Section } from '@/types';

type Action = 'view' | 'edit' | 'delete';

interface ActionButtonConfig {
  action: Action;
  color: string;
  labelKey: string;
}

interface Props {
  section: Section;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const ACTION_BUTTONS: ActionButtonConfig[] = [
  { action: 'view',   color: 'blue',   labelKey: 'sections:action.viewDetails' },
  { action: 'edit',   color: 'yellow', labelKey: 'sections:action.edit' },
  { action: 'delete', color: 'red',    labelKey: 'sections:action.delete' },
];

export function SectionActionMenu({ onView, onEdit, onDelete, isDeleting }: Props) {
  const { t } = useTranslation(['sections']);
  const { canView, canEdit, canDelete } = useSectionPermissions();

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
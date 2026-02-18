import type { ReactNode } from 'react';
import { Group, Text } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

interface DataTableToolbarProps<T> {
  selectedRows: T[];
  toolbarActions?: (selectedRows: T[]) => ReactNode;
  headerActions?: ReactNode;
}

export function DataTableToolbar<T>({
  selectedRows,
  toolbarActions,
  headerActions,
}: DataTableToolbarProps<T>) {
  const { t } = useTranslation(['common']);

  const hasSelection = selectedRows.length > 0;
  const showToolbar = hasSelection || headerActions;

  if (!showToolbar) return null;

  return (
    <Group justify="space-between" px="md" py="sm">
      <Group gap="sm">
        {hasSelection && (
          <>
            <Text size="sm" fw={500}>
              {t('common:table.selectedCount', { count: selectedRows.length })}
            </Text>
            {toolbarActions?.(selectedRows)}
          </>
        )}
      </Group>

      <Group gap="sm">
        {headerActions}
      </Group>
    </Group>
  );
}

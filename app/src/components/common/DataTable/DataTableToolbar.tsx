import type { ReactNode } from 'react';
import { Group, Text, Menu, Switch, Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import type { Table } from '@tanstack/react-table';

interface DataTableToolbarProps<T> {
  table: Table<T>;
  enableColumnVisibility?: boolean;
  selectedRows: T[];
  toolbarActions?: (selectedRows: T[]) => ReactNode;
  headerActions?: ReactNode;
}

export function DataTableToolbar<T>({
  table,
  enableColumnVisibility,
  selectedRows,
  toolbarActions,
  headerActions,
}: DataTableToolbarProps<T>) {
  const { t } = useTranslation(['common']);

  const hasSelection = selectedRows.length > 0;
  const showToolbar = enableColumnVisibility || hasSelection || headerActions;

  if (!showToolbar) return null;

  return (
    <Group justify="space-between" px="md" py="sm">
      <Group gap="sm">
        {enableColumnVisibility && (
          <Menu shadow="md" width={220} closeOnItemClick={false} position="bottom-start">
            <Menu.Target>
              <Button variant="filled" color='cyan' size="xs">
                {t('common:button.columnsSetting')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>{t('common:table.columnsVisibility')}</Menu.Label>
              {table
                .getAllLeafColumns()
                .filter((column) => column.columnDef.enableHiding !== false)
                .map((column) => {
                  const header = column.columnDef.header;
                  const displayName =
                    typeof header === 'string' && header.length > 0 ? header : column.id;

                  return (
                    <Menu.Item key={column.id} onClick={() => column.toggleVisibility()}>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm">{displayName}</Text>
                        <Switch
                          size="xs"
                          checked={column.getIsVisible()}
                          onChange={() => {}}
                          style={{ pointerEvents: 'none' }}
                        />
                      </Group>
                    </Menu.Item>
                  );
                })}
            </Menu.Dropdown>
          </Menu>
        )}
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

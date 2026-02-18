import { useState, useMemo, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type RowSelectionState,
  type VisibilityState,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, Paper, Checkbox, Group, Center, Menu, Switch, Text, ActionIcon } from '@mantine/core';
import { ArrowUp, ArrowDown, ArrowUpDown, Settings } from 'lucide-react';

const stickyLeftStyle: CSSProperties = {
  position: 'sticky',
  left: 0,
  zIndex: 1,
  background: 'var(--mantine-color-body)',
};

const stickyRightStyle: CSSProperties = {
  position: 'sticky',
  right: 0,
  zIndex: 1,
  background: 'var(--mantine-color-body)',
};

const stickyLeftHeadStyle: CSSProperties = {
  ...stickyLeftStyle,
  zIndex: 2,
};

const stickyRightHeadStyle: CSSProperties = {
  ...stickyRightStyle,
  zIndex: 2,
};
import { useTranslation } from '@/lib/i18n';
import { TablePagination } from './TablePagination';
import { TableSkeleton } from './TableSkeleton';
import { EmptyState } from './EmptyState';
import { DataTableToolbar } from './DataTableToolbar';
import type { Pagination } from '@/types';

interface DataTableProps<T> {
  data: T[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[];
  pagination?: Pagination;
  isLoading?: boolean;
  emptyMessage?: string;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  sorting?: SortingState;
  columnVisibility?: VisibilityState;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnVisibilityChange?: (state: VisibilityState) => void;
  onPaginationChange?: (page: number, limit: number) => void;
  onSelectionChange?: (rows: T[]) => void;
  toolbarActions?: (selectedRows: T[]) => ReactNode;
  headerActions?: ReactNode;
  scrollMinWidth?: number;
  compact?: boolean;
  withTopBorder?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  isLoading,
  emptyMessage,
  enableColumnVisibility,
  enableRowSelection,
  sorting: controlledSorting,
  columnVisibility: controlledColumnVisibility,
  onSortingChange,
  onColumnVisibilityChange,
  onPaginationChange,
  onSelectionChange,
  toolbarActions,
  headerActions,
  scrollMinWidth = 800,
  compact,
  withTopBorder,
}: DataTableProps<T>) {
  const { t } = useTranslation(['common']);
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({});
  const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility;
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tableColumns = useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectionColumn: ColumnDef<T, unknown> = {
      id: 'selection',
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          size="xs"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label={t('common:table.selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="xs"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 40,
    };

    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection, t]);

  const enableSorting = !!onSortingChange;

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableSorting,
    enableRowSelection: !!enableRowSelection,
    state: {
      sorting: controlledSorting ?? [],
      columnVisibility,
      rowSelection,
    },
    onSortingChange: (updater) => {
      if (!onSortingChange) return;
      const next = typeof updater === 'function' ? updater(controlledSorting ?? []) : updater;
      onSortingChange(next);
    },
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnVisibility) : updater;
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(next);
      } else {
        setInternalColumnVisibility(next);
      }
    },
    onRowSelectionChange: setRowSelection,
    pageCount: pagination?.totalPages || 0,
  });

  // Reset selection when data changes (page change, filter, etc.)
  useEffect(() => {
    setRowSelection({});
  }, [data]);

  // Compute selected rows from selection state
  const selectedRows = useMemo(() => {
    if (!enableRowSelection) return [] as T[];
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => data[Number(index)])
      .filter(Boolean);
  }, [rowSelection, data, enableRowSelection]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const showToolbar = enableRowSelection || headerActions;

  if (isLoading) {
    return (
      <Paper withBorder radius="md" style={withTopBorder ? undefined : { borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <TableSkeleton columns={tableColumns.length} rows={5} />
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" style={withTopBorder ? undefined : { borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
      {showToolbar && (
        <DataTableToolbar
          selectedRows={selectedRows}
          toolbarActions={toolbarActions}
          headerActions={headerActions}
        />
      )}

      {data.length === 0 ? (
        <EmptyState message={emptyMessage || t('common:empty.noData')} />
      ) : (
        <>
          <Table.ScrollContainer minWidth={scrollMinWidth}>
            <Table
              horizontalSpacing={compact ? 8 : 'md'}
              verticalSpacing={compact ? 6 : 'sm'}
              fz={compact ? 'sm' : undefined}
              striped={false}
              withTableBorder={false}
              style={{ width: '100%' }}
            >
              <Table.Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const isSelection = header.column.id === 'selection';
                      return (
                        <Table.Th
                          key={header.id}
                          style={{
                            ...(header.column.columnDef.size ? { width: header.column.columnDef.size } : {}),
                            ...(canSort ? { cursor: 'pointer', userSelect: 'none' } : {}),
                            ...(isSelection ? { ...stickyLeftHeadStyle, width: '1%', whiteSpace: 'nowrap' as const, paddingLeft: 8, paddingRight: 8, textAlign: 'center' as const } : {}),
                          }}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          <Group gap={4} wrap="nowrap">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <Center>
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ArrowUp size={14} />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDown size={14} />
                                ) : (
                                  <ArrowUpDown size={14} opacity={0.3} />
                                )}
                              </Center>
                            )}
                          </Group>
                        </Table.Th>
                      );
                    })}
                    {enableColumnVisibility && (
                      <Table.Th style={{ width: '1%', whiteSpace: 'nowrap', padding: '0 8px', textAlign: 'center', ...stickyRightHeadStyle }}>
                        <Menu shadow="md" width={220} closeOnItemClick={false} position="bottom-end">
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <Settings size={16} />
                            </ActionIcon>
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
                      </Table.Th>
                    )}
                  </Table.Tr>
                ))}
              </Table.Thead>
              <Table.Tbody>
                {table.getRowModel().rows.map((row) => (
                  <Table.Tr
                    key={row.id}
                    bg={row.getIsSelected() ? 'var(--mantine-color-gray-1)' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td
                        key={cell.id}
                        style={cell.column.id === 'selection' ? { ...stickyLeftStyle, width: '1%', whiteSpace: 'nowrap' as const, paddingLeft: 8, paddingRight: 8, textAlign: 'center' as const } : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Td>
                    ))}
                    {enableColumnVisibility && <Table.Td style={{ ...stickyRightStyle, width: '1%', whiteSpace: 'nowrap', padding: '0 8px' }} />}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {pagination && onPaginationChange && (
            <TablePagination pagination={pagination} onChange={onPaginationChange} />
          )}
        </>
      )}
    </Paper>
  );
}

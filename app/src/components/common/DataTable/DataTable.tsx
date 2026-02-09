import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type RowSelectionState,
  type VisibilityState,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, Paper, Checkbox } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { TablePagination } from './TablePagination';
import { TableSkeleton } from './TableSkeleton';
import { EmptyState } from './EmptyState';
import { DataTableToolbar } from './DataTableToolbar';
import type { Pagination } from '@/types';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pagination?: Pagination;
  isLoading?: boolean;
  emptyMessage?: string;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (state: VisibilityState) => void;
  onPaginationChange?: (page: number, limit: number) => void;
  onSelectionChange?: (rows: T[]) => void;
  toolbarActions?: (selectedRows: T[]) => ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  isLoading,
  emptyMessage,
  enableColumnVisibility,
  enableRowSelection,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  onPaginationChange,
  onSelectionChange,
  toolbarActions,
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

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    enableSorting: false,
    enableRowSelection: !!enableRowSelection,
    state: {
      columnVisibility,
      rowSelection,
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

  const showToolbar = enableColumnVisibility || enableRowSelection;

  if (isLoading) {
    return (
      <Paper withBorder radius="md">
        <TableSkeleton columns={tableColumns.length} rows={5} />
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md">
      {showToolbar && (
        <DataTableToolbar
          table={table}
          enableColumnVisibility={enableColumnVisibility}
          selectedRows={selectedRows}
          toolbarActions={toolbarActions}
        />
      )}

      {data.length === 0 ? (
        <EmptyState message={emptyMessage || t('common:empty.noData')} />
      ) : (
        <>
          <Table.ScrollContainer minWidth={800}>
            <Table horizontalSpacing="md" verticalSpacing="sm" striped={false} withTableBorder={false}>
              <Table.Thead bg="var(--mantine-color-gray-0)">
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Table.Th
                        key={header.id}
                        style={{
                          ...(header.column.columnDef.size ? { width: header.column.columnDef.size } : {}),
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Thead>
              <Table.Tbody>
                {table.getRowModel().rows.map((row) => (
                  <Table.Tr
                    key={row.id}
                    bg={row.getIsSelected() ? 'var(--mantine-color-primary-light)' : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Td>
                    ))}
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

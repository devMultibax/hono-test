import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
  type ColumnDef,
} from '@tanstack/react-table';
import { Table, Paper, Checkbox } from '@mantine/core';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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
  sorting?: SortingState;
  isLoading?: boolean;
  emptyMessage?: string;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (state: VisibilityState) => void;
  onPaginationChange?: (page: number, limit: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onSelectionChange?: (rows: T[]) => void;
  toolbarActions?: (selectedRows: T[]) => ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  sorting,
  isLoading,
  emptyMessage,
  enableColumnVisibility,
  enableRowSelection,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  onPaginationChange,
  onSortingChange,
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
      enableSorting: false,
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
    manualSorting: true,
    enableSorting: false,
    enableRowSelection: !!enableRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting || []) : updater;
      onSortingChange?.(newSorting);
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
    return <TableSkeleton columns={tableColumns.length} rows={5} />;
  }

  return (
    <Paper withBorder radius="md" shadow="sm">
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
            <Table>
              <Table.Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();

                      return (
                        <Table.Th
                          key={header.id}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          className={canSort ? 'cursor-pointer select-none hover:bg-gray-50' : undefined}
                          style={{
                            ...(header.column.columnDef.size ? { width: header.column.columnDef.size } : {}),
                            padding: '12px 16px',
                          }}
                        >
                          {canSort ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {sorted === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : sorted === 'desc' ? (
                                <ArrowDown size={14} />
                              ) : (
                                <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
                              )}
                            </span>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </Table.Th>
                      );
                    })}
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
                      <Table.Td key={cell.id} style={{ padding: '10px 16px' }}>
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

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Table, Box } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { TablePagination } from './TablePagination';
import { TableSkeleton } from './TableSkeleton';
import { EmptyState } from './EmptyState';
import type { Pagination } from '@/types';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  pagination?: Pagination;
  sorting?: SortingState;
  isLoading?: boolean;
  emptyMessage?: string;
  onPaginationChange?: (page: number, limit: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  sorting,
  isLoading,
  emptyMessage,
  onPaginationChange,
  onSortingChange,
}: DataTableProps<T>) {
  const { t } = useTranslation(['common']);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting || []) : updater;
      onSortingChange?.(newSorting);
    },
    pageCount: pagination?.totalPages || 0,
  });

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage || t('common:empty.noData')} />;
  }

  return (
    <Box>
      <Table.ScrollContainer minWidth={800}>
        <Table>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
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
        <TablePagination
          pagination={pagination}
          onChange={onPaginationChange}
        />
      )}
    </Box>
  );
}

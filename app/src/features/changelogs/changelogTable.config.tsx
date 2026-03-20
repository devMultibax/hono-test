import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { ChangelogActionMenu } from './components/ChangelogActionMenu';
import { formatDate } from '@/lib/date';
import type { RoleId } from '@/constants/roleConstants';
import { UPDATE_TYPE_COLORS } from './types';
import type { Changelog, ChangelogQueryParams } from './types';

// === Table Config ===

export function getDefaultParams(): ChangelogQueryParams {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return {
    page: 1,
    limit: 10,
    sort: 'updatedDate',
    order: 'desc',
    startDate: firstOfMonth.toISOString(),
    endDate: lastOfMonth.toISOString(),
  };
}

export const DEFAULT_PARAMS: ChangelogQueryParams = getDefaultParams();

export const SORT_FIELD_MAP: Record<string, string> = {};

// === Column Definitions ===

const columnHelper = createColumnHelper<Changelog>();

interface UseChangelogColumnsOptions {
  onView: (changelog: Changelog) => void;
  onEdit: (changelog: Changelog) => void;
  onDelete: (changelog: Changelog) => void;
  currentUserRole: RoleId;
  deletePendingId?: number;
}

export function useChangelogColumns({ onView, onEdit, onDelete, currentUserRole, deletePendingId }: UseChangelogColumnsOptions) {
  const { t } = useTranslation(['changelogs']);

  return useMemo(
    () => [
      columnHelper.accessor('title', {
        header: t('changelogs:table.column.title'),
        enableHiding: false,
      }),
      columnHelper.accessor('updateType', {
        header: t('changelogs:table.column.updateType'),
        cell: ({ getValue }) => {
          const type = getValue();
          return (
            <Badge color={UPDATE_TYPE_COLORS[type]} variant="light" size="sm">
              {t(`changelogs:updateType.${type}`)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('gitRef', {
        header: t('changelogs:table.column.gitRef'),
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('updatedDate', {
        header: t('changelogs:table.column.updatedDate'),
        cell: ({ getValue }) => formatDate(getValue()),
      }),
      columnHelper.accessor('createdByName', {
        header: t('changelogs:table.column.createdBy'),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <ChangelogActionMenu
            changelog={row.original}
            currentUserRole={currentUserRole}
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            isDeleting={deletePendingId === row.original.id}
          />
        ),
      }),
    ],
    [onView, onEdit, onDelete, currentUserRole, deletePendingId, t],
  );
}

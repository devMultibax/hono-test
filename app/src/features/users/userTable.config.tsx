import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Tooltip } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { RoleBadge } from '@/components/common/RoleBadge';
import { StatusSwitch } from '@/components/common/StatusSwitch';
import { UserActionMenu } from './components/UserActionMenu';
import { useUserPermissions } from './hooks/useUserPermissions';
import type { User, UserQueryParams, Status } from './types';

// === Table Config ===

export const DEFAULT_PARAMS: UserQueryParams = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
};

export const SORT_FIELD_MAP: Record<string, string> = { fullName: 'firstName' };

// === Column Definitions ===

const columnHelper = createColumnHelper<User>();

interface UseUserColumnsOptions {
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewLogs: (user: User) => void;
  onStatusChange: (user: User, status: Status) => void;
  statusPendingId?: number;
  deletePendingId?: number;
}

export function useUserColumns({ onView, onEdit, onDelete, onViewLogs, onStatusChange, statusPendingId, deletePendingId }: UseUserColumnsOptions) {
  const { t } = useTranslation(['users']);
  const { canEdit } = useUserPermissions();

  return useMemo(
    () => [
      columnHelper.accessor('username', {
        header: t('users:table.column.username'),
        enableHiding: false,
      }),
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'fullName',
        header: t('users:table.column.fullName'),
        enableHiding: false,
      }),
      columnHelper.accessor(
        (row) => row.departments?.find((d) => d.isPrimary)?.department?.name,
        {
          id: 'department',
          header: t('users:table.column.department'),
          cell: ({ row: { original } }) => {
            const primary = original.departments?.find((d) => d.isPrimary);
            const additionalCount = (original.departments?.length ?? 0) - 1;
            if (!primary?.department?.name) return '-';
            return (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {primary.department.name}
                {additionalCount > 0 && (
                  <Tooltip
                    label={original.departments
                      ?.filter((d) => !d.isPrimary)
                      .map((d) => d.department?.name)
                      .join(', ')}
                    withArrow
                  >
                    <Badge size="xs" variant="light" style={{ cursor: 'default' }}>
                      +{additionalCount}
                    </Badge>
                  </Tooltip>
                )}
              </span>
            );
          },
        },
      ),
      columnHelper.accessor(
        (row) => row.departments?.find((d) => d.isPrimary)?.section?.name,
        {
          id: 'section',
          header: t('users:table.column.section'),
          cell: ({ getValue }) => getValue() ?? '-',
        },
      ),
      columnHelper.accessor('role', {
        header: t('users:table.column.role'),
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      }),
      columnHelper.accessor('status', {
        header: t('users:table.column.status'),
        cell: ({ row }) => (
          <StatusSwitch
            status={row.original.status}
            onChange={(status) => onStatusChange(row.original, status)}
            disabled={!canEdit || statusPendingId === row.original.id}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <UserActionMenu
            user={row.original}
            onView={() => onView(row.original)}
            onViewLogs={() => onViewLogs(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            isDeleting={deletePendingId === row.original.id}
          />
        ),
      }),
    ],
    [onView, onEdit, onDelete, onViewLogs, onStatusChange, canEdit, statusPendingId, deletePendingId, t]
  );
}

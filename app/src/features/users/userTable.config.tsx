import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from '@/lib/i18n';
import { RoleBadge } from '@/components/common/RoleBadge';
import { StatusSwitch } from '@/components/common/StatusSwitch';
import { UserActionMenu } from './components/UserActionMenu';
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
  onStatusChange: (user: User, status: Status) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function useUserColumns({ onView, onEdit, onDelete, onStatusChange, canEdit, canDelete }: UseUserColumnsOptions) {
  const { t } = useTranslation(['users']);

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
      columnHelper.accessor((row) => row.department?.name, {
        id: 'department',
        header: t('users:table.column.department'),
        cell: ({ getValue }) => getValue() ?? '-',
      }),
      columnHelper.accessor((row) => row.section?.name, {
        id: 'section',
        header: t('users:table.column.section'),
        cell: ({ getValue }) => getValue() ?? '-',
      }),
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
            disabled={!canEdit}
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
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ),
      }),
    ],
    [onView, onEdit, onDelete, onStatusChange, canEdit, canDelete, t]
  );
}

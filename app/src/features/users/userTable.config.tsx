import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n';
import { RoleBadge } from '@/components/common/RoleBadge';
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
          <Switch
            checked={row.original.status === 'active'}
            onChange={(event) => {
              const newStatus: Status = event.currentTarget.checked ? 'active' : 'inactive';
              onStatusChange(row.original, newStatus);
            }}
            color="teal"
            size="sm"
            thumbIcon={
              row.original.status === 'active' ? (
                <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
              ) : (
                <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
              )
            }
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

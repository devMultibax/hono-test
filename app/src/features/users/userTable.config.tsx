import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from '@/lib/i18n';
import { RoleBadge } from '@/components/common/RoleBadge';
import { StatusSwitch } from '@/components/common/StatusSwitch';
import { UserActionMenu } from './components/UserActionMenu';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
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
  currentUserRole: RoleId;
}

export function useUserColumns({ onView, onEdit, onDelete, onStatusChange, currentUserRole }: UseUserColumnsOptions) {
  const { t } = useTranslation(['users']);

  const canEdit = hasRole([ROLE_ID.ADMIN], currentUserRole);

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
            currentUserRole={currentUserRole}
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ),
      }),
    ],
    [onView, onEdit, onDelete, onStatusChange, currentUserRole, canEdit, t]
  );
}

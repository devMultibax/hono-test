import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from '@/lib/i18n';
import { StatusSwitch } from '@/components/common/StatusSwitch';
import { DepartmentActionMenu } from './components/DepartmentActionMenu';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { Department, DepartmentQueryParams, Status } from './types';

// === Table Config ===

export const DEFAULT_PARAMS: DepartmentQueryParams = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
};

export const SORT_FIELD_MAP: Record<string, string> = {};

// === Column Definitions ===

const columnHelper = createColumnHelper<Department>();

interface UseDepartmentColumnsOptions {
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onStatusChange: (department: Department, status: Status) => void;
  currentUserRole: RoleId;
}

export function useDepartmentColumns({ onView, onEdit, onDelete, onStatusChange, currentUserRole }: UseDepartmentColumnsOptions) {
  const { t } = useTranslation(['departments']);

  const canEdit = hasRole([ROLE_ID.ADMIN], currentUserRole);

  return useMemo(
    () => [
      columnHelper.accessor('name', {
        header: t('departments:table.column.name'),
        enableHiding: false,
      }),
      columnHelper.accessor('status', {
        header: t('departments:table.column.status'),
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
          <DepartmentActionMenu
            department={row.original}
            currentUserRole={currentUserRole}
            onView={() => onView(row.original)}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ),
      }),
    ],
    [onView, onEdit, onDelete, onStatusChange, currentUserRole, canEdit, t],
  );
}

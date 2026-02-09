import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { ExportMenu } from '@/components/common/ExportMenu';
import { ImportButton } from '@/components/common/ImportButton';
import { UserFilters } from '../components/UserFilters';
import { UserActionMenu } from '../components/UserActionMenu';
import { useUsers, useDeleteUser, useBulkDeleteUsers, userKeys } from '../hooks/useUsers';
import { useConfirm } from '@/hooks/useConfirm';
import { useDataTable } from '@/hooks/useDataTable';
import { useIsAdmin } from '@/stores/auth.store';
import { userApi } from '@/api/services/user.api';
import type { User, UserQueryParams } from '@/types';

const columnHelper = createColumnHelper<User>();

const DEFAULT_PARAMS: UserQueryParams = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
};

export function UserListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { confirm, confirmDelete } = useConfirm();
  const { t } = useTranslation(['users', 'common']);

  const {
    params,
    sorting,
    columnVisibility,
    setColumnVisibility,
    handleSortingChange,
    handlePaginationChange,
    handleFilterChange,
  } = useDataTable<UserQueryParams>({ tableKey: 'users', defaultParams: DEFAULT_PARAMS });

  const { data, isLoading } = useUsers(params);
  const deleteUser = useDeleteUser();
  const bulkDeleteUsers = useBulkDeleteUsers();

  const handleDelete = useCallback(
    (user: User) => {
      confirmDelete(`${user.firstName} ${user.lastName}`, () => deleteUser.mutate(user.id));
    },
    [confirmDelete, deleteUser]
  );

  const columns = useMemo(
    (): ColumnDef<User, unknown>[] => [
      columnHelper.display({
        id: 'username',
        header: 'Username',
        enableSorting: true,
        enableHiding: false,
        cell: ({ row }) => row.original.username,
      }),
      columnHelper.display({
        id: 'fullName',
        header: t('users:table.column.fullName'),
        enableHiding: false,
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      }),
      columnHelper.display({
        id: 'department',
        header: t('users:table.column.department'),
        cell: ({ row }) => row.original.department?.name ?? '-',
      }),
      columnHelper.display({
        id: 'section',
        header: t('users:table.column.section'),
        cell: ({ row }) => row.original.section?.name ?? '-',
      }),
      columnHelper.display({
        id: 'role',
        header: t('users:table.column.role'),
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      }),
      columnHelper.display({
        id: 'status',
        header: t('users:table.column.status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => (
          <UserActionMenu
            user={row.original}
            onEdit={() => navigate(`/users/${row.original.id}/edit`)}
            onDelete={() => handleDelete(row.original)}
            onView={() => navigate(`/users/${row.original.id}`)}
            canEdit={isAdmin}
            canDelete={isAdmin}
          />
        ),
      }),
    ],
    [navigate, handleDelete, isAdmin, t]
  );

  const handleBulkDelete = useCallback(
    (selectedUsers: User[]) => {
      confirm({
        title: t('users:confirm.bulkDelete.title'),
        message: t('users:confirm.bulkDelete.message', { count: selectedUsers.length }),
        confirmLabel: t('users:confirm.bulkDelete.button'),
        onConfirm: () => bulkDeleteUsers.mutate(selectedUsers.map((u) => u.id)),
      });
    },
    [confirm, bulkDeleteUsers, t]
  );

  const handleImportSuccess = () => queryClient.invalidateQueries({ queryKey: userKeys.lists() });

  return (
    <div>
      <PageHeader
        title={t('users:page.title')}
        breadcrumbs={[{ label: t('common:breadcrumb.home'), path: '/dashboard' }, { label: t('users:breadcrumb.users') }]}
      >
        <ExportMenu onExport={() => userApi.exportExcel(params)} />
        {isAdmin && (
          <>
            <ImportButton endpoint="/users/import" onSuccess={handleImportSuccess} />
            <Button leftSection={<Plus size={16} />} onClick={() => navigate('/users/create')}>
              {t('users:action.addUser')}
            </Button>
          </>
        )}
      </PageHeader>

      <UserFilters params={params} onChange={handleFilterChange} />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        sorting={sorting}
        isLoading={isLoading}
        emptyMessage={t('users:message.empty')}
        enableColumnVisibility
        enableRowSelection={isAdmin}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        toolbarActions={(selectedRows) =>
          isAdmin && (
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<Trash2 size={14} />}
              onClick={() => handleBulkDelete(selectedRows)}
            >
              {t('common:table.deleteSelected')}
            </Button>
          )
        }
      />
    </div>
  );
}

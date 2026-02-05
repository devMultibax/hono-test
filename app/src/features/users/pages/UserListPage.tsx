import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { ExportMenu } from '@/components/common/ExportMenu';
import { ImportButton } from '@/components/common/ImportButton';
import { UserFilters } from '../components/UserFilters';
import { UserActionMenu } from '../components/UserActionMenu';
import { useUsers, useDeleteUser, userKeys } from '../hooks/useUsers';
import { useConfirm } from '@/hooks/useConfirm';
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
  const { confirmDelete } = useConfirm();
  const { t } = useTranslation(['users', 'common']);

  const [params, setParams] = useState<UserQueryParams>(DEFAULT_PARAMS);
  const { data, isLoading } = useUsers(params);
  const deleteUser = useDeleteUser();

  const handleDelete = useCallback(
    (user: User) => {
      confirmDelete(`${user.firstName} ${user.lastName}`, () => deleteUser.mutate(user.id));
    },
    [confirmDelete, deleteUser]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', { header: 'Username', enableSorting: true }),
      columnHelper.display({
        id: 'fullName',
        header: t('users:table.column.fullName'),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any,
    [navigate, handleDelete, isAdmin, t]
  );

  const handleFilterChange = (newParams: UserQueryParams) => setParams({ ...newParams, page: 1 });
  const handlePageChange = (page: number, limit: number) => setParams((p) => ({ ...p, page, limit }));
  const handleImportSuccess = () => queryClient.invalidateQueries({ queryKey: userKeys.lists() });

  return (
    <div>
      <PageHeader
        title={t('users:page.title')}
        breadcrumbs={[{ label: t('common:breadcrumb.home'), path: '/dashboard' }, { label: t('users:breadcrumb.users') }]}
      >
        <ExportMenu onExportExcel={() => userApi.exportExcel(params)} onExportPdf={() => userApi.exportPdf(params)} />
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
        isLoading={isLoading}
        emptyMessage={t('users:message.empty')}
        onPaginationChange={handlePageChange}
      />
    </div>
  );
}

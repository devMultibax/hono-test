import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
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
        header: 'ชื่อ-นามสกุล',
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
      }),
      columnHelper.display({
        id: 'department',
        header: 'แผนก',
        cell: ({ row }) => row.original.department?.name ?? '-',
      }),
      columnHelper.display({
        id: 'section',
        header: 'หน่วยงาน',
        cell: ({ row }) => row.original.section?.name ?? '-',
      }),
      columnHelper.display({
        id: 'role',
        header: 'Role',
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      }),
      columnHelper.display({
        id: 'status',
        header: 'สถานะ',
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
    [navigate, handleDelete, isAdmin]
  );

  const handleFilterChange = (newParams: UserQueryParams) => setParams({ ...newParams, page: 1 });
  const handlePageChange = (page: number, limit: number) => setParams((p) => ({ ...p, page, limit }));
  const handleImportSuccess = () => queryClient.invalidateQueries({ queryKey: userKeys.lists() });

  return (
    <div>
      <PageHeader
        title="จัดการผู้ใช้"
        breadcrumbs={[{ label: 'หน้าหลัก', path: '/dashboard' }, { label: 'ผู้ใช้งาน' }]}
      >
        <ExportMenu onExportExcel={() => userApi.exportExcel(params)} onExportPdf={() => userApi.exportPdf(params)} />
        {isAdmin && (
          <>
            <ImportButton endpoint="/users/import" onSuccess={handleImportSuccess} />
            <Button leftSection={<Plus size={16} />} onClick={() => navigate('/users/create')}>
              เพิ่มผู้ใช้
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
        emptyMessage="ไม่พบผู้ใช้งาน"
        onPaginationChange={handlePageChange}
      />
    </div>
  );
}

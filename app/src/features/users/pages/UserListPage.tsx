import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { ExportButton } from '@/components/common/ExportButton';
import { ImportButton } from '@/components/common/ImportButton';
import { UserFilters } from '../components/UserFilters';
import { useUsers, useDeleteUser, useUpdateUser, useBulkDeleteUsers, userKeys } from '../hooks/useUsers';
import { useUserColumns } from '../hooks/useUserColumns';
import { DEFAULT_PARAMS, SORT_FIELD_MAP, SORT_FIELD_REVERSE } from '../hooks/userTable.config';
import { useConfirm } from '@/hooks/useConfirm';
import { useDataTable } from '@/hooks/useDataTable';
import { useIsAdmin } from '@/stores/auth.store';
import { userApi } from '@/api/services/user.api';
import type { User, UserQueryParams, Status } from '@/types';

export function UserListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { confirm, confirmDelete } = useConfirm();
  const { t } = useTranslation(['users', 'common']);

  const {
    params,
    sorting: rawSorting,
    columnVisibility,
    setColumnVisibility,
    handleSortingChange: rawHandleSortingChange,
    handlePaginationChange,
    handleFilterChange,
  } = useDataTable<UserQueryParams>({ tableKey: 'users', defaultParams: DEFAULT_PARAMS });

  // Map DB field back to column id for UI sort indicator
  const sorting: SortingState = useMemo(
    () => rawSorting.map((s) => ({ ...s, id: SORT_FIELD_REVERSE[s.id] ?? s.id })),
    [rawSorting]
  );

  // Map column id to DB field before sending to API, fallback to default sort when cleared
  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      if (newSorting.length === 0) {
        rawHandleSortingChange([
          { id: DEFAULT_PARAMS.sort!, desc: DEFAULT_PARAMS.order === 'desc' },
        ]);
      } else {
        rawHandleSortingChange(
          newSorting.map((s) => ({ ...s, id: SORT_FIELD_MAP[s.id] ?? s.id }))
        );
      }
    },
    [rawHandleSortingChange]
  );

  const { data, isLoading } = useUsers(params);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const bulkDeleteUsers = useBulkDeleteUsers();

  const handleDelete = useCallback(
    (user: User) => {
      confirmDelete(`${user.firstName} ${user.lastName}`, () => deleteUser.mutate(user.id));
    },
    [confirmDelete, deleteUser]
  );

  const handleStatusChange = useCallback(
    (user: User, status: Status) => {
      updateUser.mutate({ id: user.id, data: { status } });
    },
    [updateUser]
  );

  const columns = useUserColumns({
    onView: (user) => navigate(`/users/${user.id}`),
    onEdit: (user) => navigate(`/users/${user.id}/edit`),
    onDelete: handleDelete,
    onStatusChange: handleStatusChange,
    canEdit: isAdmin,
    canDelete: isAdmin,
  });

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

  const handleImportSuccess = useCallback(
    () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    [queryClient]
  );

  const headerActions = useMemo(() => (
    <>
      <ExportButton onExport={() => userApi.exportExcel(params)} />
      {isAdmin && (
        <>
          <ImportButton endpoint="/users/import" onSuccess={handleImportSuccess} />
          <Button
            variant="filled"
            size="xs"
            onClick={() => navigate('/users/create')}
          >
            {t('users:action.addUser')}
          </Button>
        </>
      )}
    </>
  ), [params, isAdmin, handleImportSuccess, navigate, t]);

  return (
    <div>
      <PageHeader
        title={t('users:page.title')}
        breadcrumbs={[{ label: t('common:breadcrumb.home'), path: '/dashboard' }, { label: t('users:breadcrumb.users') }]}
      />

      <UserFilters params={params} onChange={handleFilterChange} />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage={t('users:message.empty')}
        enableColumnVisibility
        enableRowSelection={isAdmin}
        sorting={sorting}
        columnVisibility={columnVisibility}
        onSortingChange={handleSortingChange}
        onColumnVisibilityChange={setColumnVisibility}
        onPaginationChange={handlePaginationChange}
        toolbarActions={(selectedRows) =>
          isAdmin && (
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => handleBulkDelete(selectedRows)}
            >
              {t('common:table.deleteSelected')}
            </Button>
          )
        }
        headerActions={headerActions}
      />
    </div>
  );
}

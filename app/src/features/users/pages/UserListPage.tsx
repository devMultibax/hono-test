import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ImportButton } from '@/components/common/ImportButton';
import { UserExportDrawer } from '../components/UserExportDrawer';
import { UserFilters } from '../components/UserFilters';
import { UserDrawer } from '../components/UserDrawer';
import { useUsers, useUserActions } from '../hooks/useUsers';
import { useUserColumns, DEFAULT_PARAMS, SORT_FIELD_MAP } from '../userTable.config';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { useDataTable } from '@/hooks/useDataTable';
import { useRefresh } from '@/hooks/useRefresh';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { useUser } from '@/stores/auth.store';
import { usePageActions } from '@/contexts/PageHeaderContext';
import { userApi } from '@/api/services/user.api';
import type { User } from '@/types';
import type { UserQueryParams, UserDrawerState } from '../types';

export function UserListPage() {
  // ─── 1. Hooks & Context ───
  const currentUser = useUser();
  const { t } = useTranslation(['users', 'common']);
  const { setActions } = usePageActions();
  const navigate = useNavigate();
  const { isAdmin, canCreate, canImport, canExport, canBulkDelete } = useUserPermissions();

  // ─── 2. Local UI State ───
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<UserDrawerState>({ mode: 'closed' });

  // ─── 3. Feature Hooks ───
  const actions = useUserActions();

  // ─── 4. Stable Callbacks ───
  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((userId: number) => setDrawer({ mode: 'detail', userId }), []);
  const openEdit = useCallback((userId: number) => setDrawer({ mode: 'edit', userId }), []);
  const closeDrawer = useCallback(() => setDrawer({ mode: 'closed' }), []);
  const openLogs = useCallback((user: User) => navigate(`/users/${user.username}/logs`), [navigate]);

  // ─── 5. Table State ───
  const {
    params,
    sorting,
    columnVisibility,
    setColumnVisibility,
    handleSortingChange,
    handlePaginationChange,
    handleFilterChange,
  } = useDataTable<UserQueryParams>({
    tableKey: 'users',
    defaultParams: DEFAULT_PARAMS,
    sortFieldMap: SORT_FIELD_MAP,
  });

  // ─── 6. Data Fetching ───
  const userDepartmentIds = useMemo(
    () => currentUser?.departments?.map((d) => d.departmentId) ?? [],
    [currentUser?.departments]
  );
  const queryParams = useMemo(() => {
    if (isAdmin) return params;
    if (params.departmentId) return params;
    return { ...params, departmentIds: userDepartmentIds.join(',') || undefined };
  }, [isAdmin, params, userDepartmentIds]);
  const { data, isLoading, isFetching, refetch, isRefetching } = useUsers(queryParams);
  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });
  useNavigationProgress(isFetching);

  // ─── 7. Column Config ───
  const columns = useUserColumns({
    onView: (user) => openDetail(user.id),
    onEdit: (user) => openEdit(user.id),
    onDelete: actions.handleDelete,
    onViewLogs: openLogs,
    onStatusChange: actions.handleStatusChange,
    statusPendingId: actions.statusPendingId,
    deletePendingId: actions.deletePendingId,
  });

  // ─── 8. Header Actions ───
  const { handleImportSuccess } = actions;

  const headerActions = useMemo(() => (
    <>
      <Button variant="subtle" size="xs" onClick={handleRefresh} loading={isRefreshLoading}>
        {t('common:action.refresh', 'Refresh')}
      </Button>

      {canExport && (
        <Button variant="subtle" size="xs" onClick={() => setExportOpened(true)}>
          {t('common:button.downloadReport')}
        </Button>
      )}

      {canImport && (
        <ImportButton
          endpoint="/users/import"
          onSuccess={handleImportSuccess}
          onDownloadTemplate={() => userApi.downloadTemplate()}
          expectedFileName="User_Import_Template.xlsx"
          showCredentials
        />
      )}

      {canCreate && (
        <Button variant="filled" size="xs" onClick={openCreate}>
          {t('users:action.addUser')}
        </Button>
      )}
    </>
  ), [canExport, canImport, canCreate, handleRefresh, isRefreshLoading, t, handleImportSuccess, openCreate]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  const toolbarActions = useCallback((selectedRows: User[]) =>
    canBulkDelete && (
      <Button
        size="xs"
        variant="light"
        color="red"
        onClick={() => actions.handleBulkDelete(selectedRows)}
      >
        {t('common:table.deleteSelected')}
      </Button>
    ),
    [canBulkDelete, actions, t]);

  // ─── 9. Render ───
  return (
    <div>
      <UserFilters
        params={params}
        onChange={handleFilterChange}
        userDepartmentIds={userDepartmentIds}
      />

      <UserExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams, signal) => userApi.exportExcel(exportParams, signal)}
      />

      <UserDrawer
        state={drawer}
        onClose={closeDrawer}
        onEdit={openEdit}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage={t('users:message.empty')}
        enableColumnVisibility
        enableRowSelection={canBulkDelete}
        sorting={sorting}
        columnVisibility={columnVisibility}
        onSortingChange={handleSortingChange}
        onColumnVisibilityChange={setColumnVisibility}
        onPaginationChange={handlePaginationChange}
        toolbarActions={toolbarActions}
        compact
      />
    </div>
  );
}

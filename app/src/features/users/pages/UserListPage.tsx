import { useState, useMemo, useCallback } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ImportButton } from '@/components/common/ImportButton';
import { UserExportDrawer } from '../components/UserExportDrawer';
import { UserFilters } from '../components/UserFilters';
import { UserDrawer } from '../components/UserDrawer';
import { useUsers, useUserActions } from '../hooks/useUsers';
import { useUserColumns, DEFAULT_PARAMS, SORT_FIELD_MAP } from '../userTable.config';
import { useDataTable } from '@/hooks/useDataTable';
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { userApi } from '@/api/services/user.api';
import type { UserQueryParams, UserDrawerState } from '../types';

export function UserListPage() {
  const userRole = useUserRole();
  const { t } = useTranslation(['users', 'common']);
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<UserDrawerState>({ mode: 'closed' });

  const actions = useUserActions();
  const isAdmin = hasRole([ROLE_ID.ADMIN], userRole);

  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((userId: number) => setDrawer({ mode: 'detail', userId }), []);
  const openEdit = useCallback((userId: number) => setDrawer({ mode: 'edit', userId }), []);
  const closeDrawer = useCallback(() => setDrawer({ mode: 'closed' }), []);

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

  const { data, isLoading } = useUsers(params);

  const columns = useUserColumns({
    onView: (user) => openDetail(user.id),
    onEdit: (user) => openEdit(user.id),
    onDelete: actions.handleDelete,
    onStatusChange: actions.handleStatusChange,
    currentUserRole: userRole,
  });

  const headerActions = useMemo(() => (
    <>
      <Button variant="light" color="teal" size="xs" onClick={() => setExportOpened(true)}>
        {t('common:button.downloadReport')}
      </Button>
      {isAdmin && (
          <ImportButton endpoint="/users/import" onSuccess={actions.handleImportSuccess} onDownloadTemplate={() => userApi.downloadTemplate()} />
      )}
      <Button variant="filled" size="xs" onClick={openCreate}>
        {t('users:action.addUser')}
      </Button>
    </>
  ), [isAdmin, actions.handleImportSuccess, openCreate, t]);

  return (
    <div>

      <UserFilters params={params} onChange={handleFilterChange} />

      <UserExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams) => userApi.exportExcel(exportParams)}
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
              onClick={() => actions.handleBulkDelete(selectedRows)}
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

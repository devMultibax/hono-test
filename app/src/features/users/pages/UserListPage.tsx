import { useState, useMemo } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ImportButton } from '@/components/common/ImportButton';
import { UserExportDrawer } from '../components/UserExportDrawer';
import { UserFilters } from '../components/UserFilters';
import { UserCreateDrawer } from '../components/UserCreateDrawer';
import { UserDetailDrawer } from '../components/UserDetailDrawer';
import { UserEditDrawer } from '../components/UserEditDrawer';
import { useUsers } from '../hooks/useUsers';
import { useUserColumns } from '../hooks/useUserColumns';
import { useUserDrawer } from '../hooks/useUserDrawer';
import { useUserActions } from '../hooks/useUserActions';
import { DEFAULT_PARAMS, SORT_FIELD_MAP } from '../hooks/userTable.config';
import { useDataTable } from '@/hooks/useDataTable';
import { useIsAdmin } from '@/stores/auth.store';
import { userApi } from '@/api/services/user.api';
import type { UserQueryParams } from '../types';

export function UserListPage() {
  const isAdmin = useIsAdmin();
  const { t } = useTranslation(['users', 'common']);
  const [exportOpened, setExportOpened] = useState(false);

  const drawer = useUserDrawer();
  const actions = useUserActions();

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
    onView: (user) => drawer.openDetail(user.id),
    onEdit: (user) => drawer.openEdit(user.id),
    onDelete: actions.handleDelete,
    onStatusChange: actions.handleStatusChange,
    canEdit: isAdmin,
    canDelete: isAdmin,
  });

  const headerActions = useMemo(() => (
    <>
      <Button variant="light" color="teal" size="xs" onClick={() => setExportOpened(true)}>
        {t('common:button.downloadReport')}
      </Button>
      {isAdmin && (
          <ImportButton endpoint="/users/import" onSuccess={actions.handleImportSuccess} onDownloadTemplate={() => userApi.downloadTemplate()} />
      )}
      <Button variant="filled" size="xs" onClick={drawer.openCreate}>
        {t('users:action.addUser')}
      </Button>
    </>
  ), [isAdmin, actions.handleImportSuccess, drawer.openCreate, t]);

  return (
    <div>

      <UserFilters params={params} onChange={handleFilterChange} />

      <UserExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams) => userApi.exportExcel(exportParams)}
      />

      <UserCreateDrawer
        opened={drawer.drawer.mode === 'create'}
        onClose={drawer.close}
      />

      <UserDetailDrawer
        opened={drawer.drawer.mode === 'detail'}
        onClose={drawer.close}
        userId={drawer.userId}
        onEdit={drawer.openEdit}
      />

      <UserEditDrawer
        opened={drawer.drawer.mode === 'edit'}
        onClose={drawer.close}
        userId={drawer.userId}
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

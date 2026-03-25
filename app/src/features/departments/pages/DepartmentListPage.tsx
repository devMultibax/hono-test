import { Fragment, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ImportButton } from '@/components/common/ImportButton';
import { DepartmentExportDrawer } from '../components/DepartmentExportDrawer';
import { DepartmentFilters } from '../components/DepartmentFilters';
import { DepartmentDrawer } from '../components/DepartmentDrawer';
import { useDepartments, useDepartmentActions } from '../hooks/useDepartments';
import { useDepartmentColumns, DEFAULT_PARAMS, SORT_FIELD_MAP } from '../departmentTable.config';
import { useDataTable } from '@/hooks/useDataTable';
import { useRefresh } from '@/hooks/useRefresh';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { useUserRole } from '@/stores/auth.store';
import { usePageActions } from '@/contexts/PageHeaderContext';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { departmentApi } from '@/api/services/department.api';
import type { Department } from '@/types';
import type { DepartmentQueryParams, DepartmentDrawerState } from '../types';

// ─── Header Action Config ───
type HeaderAction = 'refresh' | 'export' | 'import' | 'create';

interface HeaderActionConfig {
  action: HeaderAction;
  allowedRoles: readonly RoleId[];
}

const HEADER_ACTIONS: HeaderActionConfig[] = [
  { action: 'refresh', allowedRoles: [ROLE_ID.ADMIN] },
  { action: 'export', allowedRoles: [ROLE_ID.ADMIN] },
  { action: 'import', allowedRoles: [ROLE_ID.ADMIN] },
  { action: 'create', allowedRoles: [ROLE_ID.ADMIN] },
];

// ─── Toolbar Action Config ───
const TOOLBAR_ALLOWED_ROLES: readonly RoleId[] = [ROLE_ID.ADMIN];

export function DepartmentListPage() {
  // ─── 1. Hooks & Context ───
  const userRole = useUserRole();
  const { t } = useTranslation(['departments', 'common']);
  const { setActions } = usePageActions();

  // ─── 2. Local UI State ───
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<DepartmentDrawerState>({ mode: 'closed' });

  // ─── 3. Feature Hooks ───
  const actions = useDepartmentActions();

  // ─── 4. Stable Callbacks ───
  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((departmentId: number) => setDrawer({ mode: 'detail', departmentId }), []);
  const openEdit = useCallback((departmentId: number) => setDrawer({ mode: 'edit', departmentId }), []);
  const closeDrawer = useCallback(() => setDrawer({ mode: 'closed' }), []);

  // ─── 5. Table State ───
  const {
    params,
    sorting,
    columnVisibility,
    setColumnVisibility,
    handleSortingChange,
    handlePaginationChange,
    handleFilterChange,
  } = useDataTable<DepartmentQueryParams>({
    tableKey: 'departments',
    defaultParams: DEFAULT_PARAMS,
    sortFieldMap: SORT_FIELD_MAP,
  });

  // ─── 6. Data Fetching ───
  const { data, isLoading, isFetching, refetch, isRefetching } = useDepartments(params);
  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });
  useNavigationProgress(isFetching);

  // ─── 7. Column Config ───
  const columns = useDepartmentColumns({
    onView: (department) => openDetail(department.id),
    onEdit: (department) => openEdit(department.id),
    onDelete: actions.handleDelete,
    onStatusChange: actions.handleStatusChange,
    currentUserRole: userRole,
    statusPendingId: actions.statusPendingId,
    deletePendingId: actions.deletePendingId,
  });

  // ─── 8. Header Actions ───

  const { handleImportSuccess } = actions;

  const headerActions = useMemo(() => {
    const renderAction = (action: HeaderAction) => {
      switch (action) {
        case 'refresh':
          return (
            <Button variant="subtle" size="xs" onClick={handleRefresh} loading={isRefreshLoading}>
              {t('common:action.refresh', 'Refresh')}
            </Button>
          );
        case 'export':
          return (
            <Button variant="subtle" size="xs" onClick={() => setExportOpened(true)}>
              {t('common:button.downloadReport')}
            </Button>
          );
        case 'import':
          return (
            <ImportButton endpoint="/departments/import" onSuccess={handleImportSuccess} onDownloadTemplate={() => departmentApi.downloadTemplate()} expectedFileName="Department_Import_Template.xlsx" />
          );
        case 'create':
          return (
            <Button variant="filled" size="xs" onClick={openCreate}>
              {t('departments:action.addDepartment')}
            </Button>
          );
      }
    };

    return (
      <>
        {HEADER_ACTIONS
          .filter((config) => hasRole(config.allowedRoles, userRole))
          .map((config) => (
            <Fragment key={config.action}>{renderAction(config.action)}</Fragment>
          ))}
      </>
    );
  }, [userRole, handleRefresh, isRefreshLoading, t, handleImportSuccess, openCreate]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  const canBulkDelete = hasRole(TOOLBAR_ALLOWED_ROLES, userRole);

  const toolbarActions = useCallback((selectedRows: Department[]) =>
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
      <DepartmentFilters
        params={params}
        onChange={handleFilterChange}
      />

      <DepartmentExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams, signal) => departmentApi.exportExcel(exportParams, signal)}
      />

      <DepartmentDrawer
        state={drawer}
        onClose={closeDrawer}
        onEdit={openEdit}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage={t('departments:message.empty')}
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

import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
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
import { useUserRole } from '@/stores/auth.store';
import { usePageActions } from '@/contexts/PageHeaderContext';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { departmentApi } from '@/api/services/department.api';
import type { Department } from '@/types';
import type { DepartmentQueryParams, DepartmentDrawerState } from '../types';

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
  const isAdmin = hasRole([ROLE_ID.ADMIN], userRole);

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
  const { data, isLoading, refetch, isRefetching } = useDepartments(params);
  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });

  // ─── 7. Column Config ───
  const columns = useDepartmentColumns({
    onView: (department) => openDetail(department.id),
    onEdit: (department) => openEdit(department.id),
    onDelete: actions.handleDelete,
    onStatusChange: actions.handleStatusChange,
    currentUserRole: userRole,
  });

  // ─── 8. Header Actions ───

  const headerActions = useMemo(() => (
    <>
      <Button
        variant="subtle"
        size="xs"
        onClick={handleRefresh}
        loading={isRefreshLoading}
      >
        {t('common:action.refresh', 'Refresh')}
      </Button>
      <Button variant="subtle" size="xs" onClick={() => setExportOpened(true)}>
        {t('common:button.downloadReport')}
      </Button>
      {isAdmin && (
        <ImportButton endpoint="/departments/import" onSuccess={actions.handleImportSuccess} onDownloadTemplate={() => departmentApi.downloadTemplate()} />
      )}
      <Button variant="filled" size="xs" onClick={openCreate}>
        {t('departments:action.addDepartment')}
      </Button>
    </>
  ), [isAdmin, actions.handleImportSuccess, openCreate, t, isRefreshLoading, handleRefresh]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  const toolbarActions = useCallback((selectedRows: Department[]) =>
    isAdmin && (
      <Button
        size="xs"
        variant="light"
        color="red"
        onClick={() => actions.handleBulkDelete(selectedRows)}
      >
        {t('common:table.deleteSelected')}
      </Button>
    ),
    [isAdmin, actions, t]);

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
        enableRowSelection={isAdmin}
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

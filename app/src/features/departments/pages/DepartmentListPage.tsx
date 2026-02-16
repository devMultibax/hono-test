import { useState, useMemo, useCallback } from 'react';
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
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { departmentApi } from '@/api/services/department.api';
import type { Department } from '@/types';
import type { DepartmentQueryParams, DepartmentDrawerState } from '../types';

export function DepartmentListPage() {
  const userRole = useUserRole();
  const { t } = useTranslation(['departments', 'common']);
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<DepartmentDrawerState>({ mode: 'closed' });

  const actions = useDepartmentActions();
  const isAdmin = hasRole([ROLE_ID.ADMIN], userRole);

  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((departmentId: number) => setDrawer({ mode: 'detail', departmentId }), []);
  const openEdit = useCallback((departmentId: number) => setDrawer({ mode: 'edit', departmentId }), []);
  const closeDrawer = useCallback(() => setDrawer({ mode: 'closed' }), []);

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

  const { data, isLoading } = useDepartments(params);

  const columns = useDepartmentColumns({
    onView: (department) => openDetail(department.id),
    onEdit: (department) => openEdit(department.id),
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
        <ImportButton endpoint="/departments/import" onSuccess={actions.handleImportSuccess} onDownloadTemplate={() => departmentApi.downloadTemplate()} />
      )}
      <Button variant="filled" size="xs" onClick={openCreate}>
        {t('departments:action.addDepartment')}
      </Button>
    </>
  ), [isAdmin, actions.handleImportSuccess, openCreate, t]);

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

  return (
    <div>
      <DepartmentFilters params={params} onChange={handleFilterChange} />

      <DepartmentExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams) => departmentApi.exportExcel(exportParams)}
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
        headerActions={headerActions}
        compact
      />
    </div>
  );
}

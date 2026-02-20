import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ImportButton } from '@/components/common/ImportButton';
import { SectionExportDrawer } from '../components/SectionExportDrawer';
import { SectionFilters } from '../components/SectionFilters';
import { SectionDrawer } from '../components/SectionDrawer';
import { useSections, useSectionActions } from '../hooks/useSections';
import { useSectionColumns, DEFAULT_PARAMS, SORT_FIELD_MAP } from '../sectionTable.config';
import { useDataTable } from '@/hooks/useDataTable';
import { useRefresh } from '@/hooks/useRefresh';
import { useUserRole } from '@/stores/auth.store';
import { usePageActions } from '@/contexts/PageHeaderContext';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { sectionApi } from '@/api/services/section.api';
import type { Section } from '@/types';
import type { SectionQueryParams, SectionDrawerState } from '../types';

export function SectionListPage() {
  // ─── 1. Hooks & Context ───
  const userRole = useUserRole();
  const { t } = useTranslation(['sections', 'common']);
  const { setActions } = usePageActions();

  // ─── 2. Local UI State ───
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<SectionDrawerState>({ mode: 'closed' });

  // ─── 3. Feature Hooks ───
  const actions = useSectionActions();
  const isAdmin = hasRole([ROLE_ID.ADMIN], userRole);

  // ─── 4. Stable Callbacks ───
  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((sectionId: number) => setDrawer({ mode: 'detail', sectionId }), []);
  const openEdit = useCallback((sectionId: number) => setDrawer({ mode: 'edit', sectionId }), []);
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
  } = useDataTable<SectionQueryParams>({
    tableKey: 'sections',
    defaultParams: DEFAULT_PARAMS,
    sortFieldMap: SORT_FIELD_MAP,
  });

  // ─── 6. Data Fetching ───
  const { data, isLoading, refetch, isRefetching } = useSections(params);
  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });

  // ─── 7. Column Config ───
  const columns = useSectionColumns({
    onView: (section) => openDetail(section.id),
    onEdit: (section) => openEdit(section.id),
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
        <ImportButton endpoint="/sections/import" onSuccess={actions.handleImportSuccess} onDownloadTemplate={() => sectionApi.downloadTemplate()} />
      )}
      <Button variant="filled" size="xs" onClick={openCreate}>
        {t('sections:action.addSection')}
      </Button>
    </>
  ), [isAdmin, actions.handleImportSuccess, openCreate, t, isRefreshLoading, handleRefresh]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  const toolbarActions = useCallback((selectedRows: Section[]) =>
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
      <SectionFilters
        params={params}
        onChange={handleFilterChange}
      />

      <SectionExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams, signal) => sectionApi.exportExcel(exportParams, signal)}
      />

      <SectionDrawer
        state={drawer}
        onClose={closeDrawer}
        onEdit={openEdit}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage={t('sections:message.empty')}
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

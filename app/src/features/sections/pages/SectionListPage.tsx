import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ImportButton } from '@/components/common/ImportButton';
import { SectionExportDrawer } from '../components/SectionExportDrawer';
import { SectionFilters } from '../components/SectionFilters';
import { SectionDrawer } from '../components/SectionDrawer';
import { useSections, useSectionActions } from '../hooks/useSections';
import { useSectionPermissions } from '../hooks/useSectionPermissions';
import { useSectionColumns, DEFAULT_PARAMS, SORT_FIELD_MAP } from '../sectionTable.config';
import { useDataTable } from '@/hooks/useDataTable';
import { useRefresh } from '@/hooks/useRefresh';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { usePageActions } from '@/contexts/PageHeaderContext';
import { sectionApi } from '@/api/services/section.api';
import type { Section } from '@/types';
import type { SectionQueryParams, SectionDrawerState } from '../types';

export function SectionListPage() {
  // ─── 1. Hooks & Context ───
  const { t } = useTranslation(['sections', 'common']);
  const { setActions } = usePageActions();
  const { canCreate, canImport, canExport, canBulkDelete } = useSectionPermissions();

  // ─── 2. Local UI State ───
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<SectionDrawerState>({ mode: 'closed' });

  // ─── 3. Feature Hooks ───
  const actions = useSectionActions();

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
  const { data, isLoading, isFetching, refetch, isRefetching } = useSections(params);
  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });
  useNavigationProgress(isFetching);

  // ─── 7. Column Config ───
  const columns = useSectionColumns({
    onView: (section) => openDetail(section.id),
    onEdit: (section) => openEdit(section.id),
    onDelete: actions.handleDelete,
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
          endpoint="/sections/import"
          onSuccess={handleImportSuccess}
          onDownloadTemplate={() => sectionApi.downloadTemplate()}
          expectedFileName="Section_Import_Template.xlsx"
        />
      )}

      {canCreate && (
        <Button variant="filled" size="xs" onClick={openCreate}>
          {t('sections:action.addSection')}
        </Button>
      )}
    </>
  ), [canExport, canImport, canCreate, handleRefresh, isRefreshLoading, t, handleImportSuccess, openCreate]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  const toolbarActions = useCallback((selectedRows: Section[]) =>
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
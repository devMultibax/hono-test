import { useState, useMemo, useCallback } from 'react';
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
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { sectionApi } from '@/api/services/section.api';
import type { Section } from '@/types';
import type { SectionQueryParams, SectionDrawerState } from '../types';

export function SectionListPage() {
  const userRole = useUserRole();
  const { t } = useTranslation(['sections', 'common']);
  const [exportOpened, setExportOpened] = useState(false);
  const [drawer, setDrawer] = useState<SectionDrawerState>({ mode: 'closed' });

  const actions = useSectionActions();
  const isAdmin = hasRole([ROLE_ID.ADMIN], userRole);

  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((sectionId: number) => setDrawer({ mode: 'detail', sectionId }), []);
  const openEdit = useCallback((sectionId: number) => setDrawer({ mode: 'edit', sectionId }), []);
  const closeDrawer = useCallback(() => setDrawer({ mode: 'closed' }), []);

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

  const { data, isLoading } = useSections(params);

  const columns = useSectionColumns({
    onView: (section) => openDetail(section.id),
    onEdit: (section) => openEdit(section.id),
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
        <ImportButton endpoint="/sections/import" onSuccess={actions.handleImportSuccess} onDownloadTemplate={() => sectionApi.downloadTemplate()} />
      )}
      <Button variant="filled" size="xs" onClick={openCreate}>
        {t('sections:action.addSection')}
      </Button>
    </>
  ), [isAdmin, actions.handleImportSuccess, openCreate, t]);

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

  return (
    <div>
      <SectionFilters params={params} onChange={handleFilterChange} />

      <SectionExportDrawer
        opened={exportOpened}
        onClose={() => setExportOpened(false)}
        initialParams={params}
        onExport={(exportParams) => sectionApi.exportExcel(exportParams)}
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
        headerActions={headerActions}
        compact
      />
    </div>
  );
}

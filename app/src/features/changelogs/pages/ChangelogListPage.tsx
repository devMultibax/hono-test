import { useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

import { DataTable } from '@/components/common/DataTable/DataTable';
import { ChangelogFilters } from '../components/ChangelogFilters';
import { ChangelogDrawer } from '../components/ChangelogDrawer';
import { useChangelogs, useChangelogActions } from '../hooks/useChangelogs';
import { useChangelogPermissions } from '../hooks/useChangelogPermissions';
import { useChangelogColumns, DEFAULT_PARAMS, SORT_FIELD_MAP } from '../changelogTable.config';
import { useDataTable } from '@/hooks/useDataTable';
import { useRefresh } from '@/hooks/useRefresh';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { usePageActions } from '@/contexts/PageHeaderContext';
import type { ChangelogQueryParams, ChangelogDrawerState } from '../types';

export function ChangelogListPage() {
  // ─── 1. Hooks & Context ───
  const { t } = useTranslation(['changelogs', 'common']);
  const { setActions } = usePageActions();
  const { canCreate } = useChangelogPermissions();

  // ─── 2. Local UI State ───
  const [drawer, setDrawer] = useState<ChangelogDrawerState>({ mode: 'closed' });

  // ─── 3. Feature Hooks ───
  const actions = useChangelogActions();

  // ─── 4. Stable Callbacks ───
  const openCreate = useCallback(() => setDrawer({ mode: 'create' }), []);
  const openDetail = useCallback((changelogId: number) => setDrawer({ mode: 'detail', changelogId }), []);
  const openEdit = useCallback((changelogId: number) => setDrawer({ mode: 'edit', changelogId }), []);
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
  } = useDataTable<ChangelogQueryParams>({
    tableKey: 'changelogs',
    defaultParams: DEFAULT_PARAMS,
    sortFieldMap: SORT_FIELD_MAP,
  });

  // ─── 6. Data Fetching ───
  const { data, isLoading, isFetching, refetch, isRefetching } = useChangelogs(params);
  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });
  useNavigationProgress(isFetching);

  // ─── 7. Column Config ───
  const columns = useChangelogColumns({
    onView: (changelog) => openDetail(changelog.id),
    onEdit: (changelog) => openEdit(changelog.id),
    onDelete: actions.handleDelete,
    deletePendingId: actions.deletePendingId,
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

      {canCreate && (
        <Button variant="filled" size="xs" onClick={openCreate}>
          {t('changelogs:action.addChangelog')}
        </Button>
      )}
    </>
  ), [canCreate, openCreate, t, isRefreshLoading, handleRefresh]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  // ─── 9. Render ───
  return (
    <div>
      <ChangelogFilters
        params={params}
        onChange={handleFilterChange}
      />

      <ChangelogDrawer
        state={drawer}
        onClose={closeDrawer}
        onEdit={openEdit}
      />

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage={t('changelogs:message.empty')}
        enableColumnVisibility
        sorting={sorting}
        columnVisibility={columnVisibility}
        onSortingChange={handleSortingChange}
        onColumnVisibilityChange={setColumnVisibility}
        onPaginationChange={handlePaginationChange}
        compact
      />
    </div>
  );
}
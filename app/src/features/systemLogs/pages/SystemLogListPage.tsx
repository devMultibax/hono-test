import { useState, useCallback, useMemo, useEffect, useLayoutEffect } from 'react';
import { Button } from '@mantine/core';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useTranslation } from '@/lib/i18n';
import { usePageActions } from '@/contexts/PageHeaderContext';

dayjs.extend(isBetween);
import { DataTable } from '@/components/common/DataTable/DataTable';
import { SystemLogFilters } from '../components/SystemLogFilters';
import { useRefresh } from '@/hooks/useRefresh';
import { useSystemLogs } from '../hooks/useSystemLogs';
import { useSystemLogColumns } from '../systemLogTable.config';
import type { SystemLog, SystemLogQueryParams } from '../types';

const getFirstDayOfMonth = () => {
  return dayjs().startOf('month').format('YYYY-MM-DDTHH:mm');
};

const getLastDayOfMonth = () => {
  return dayjs().endOf('month').format('YYYY-MM-DDTHH:mm');
};

const INITIAL_PARAMS: SystemLogQueryParams = {
  startDateTime: getFirstDayOfMonth(),
  endDateTime: getLastDayOfMonth(),
  level: '',
};

// Client-side filtering
function filterLogs(logs: SystemLog[], filters: SystemLogQueryParams): SystemLog[] {
  return logs.filter((log) => {
    // Filter by level
    if (filters.level && log.level !== filters.level) {
      return false;
    }

    // Filter by datetime range
    const logTime = dayjs(log.datetime);
    const start = dayjs(filters.startDateTime);
    const end = dayjs(filters.endDateTime);

    if (!logTime.isBetween(start, end, null, '[]')) {
      return false;
    }

    return true;
  });
}

export function SystemLogListPage() {
  const { t } = useTranslation(['systemLogs', 'common']);
  const [params, setParams] = useState<SystemLogQueryParams>(INITIAL_PARAMS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = useSystemLogColumns();

  // Fetch logs with initial date range
  const { data, isLoading, refetch, isRefetching } = useSystemLogs(INITIAL_PARAMS, true);

  // Refetch when date range changes significantly
  useEffect(() => {
    const currentStart = dayjs(params.startDateTime);
    const initialStart = dayjs(INITIAL_PARAMS.startDateTime);

    // Refetch if month/year changed
    if (!currentStart.isSame(initialStart, 'month') || !currentStart.isSame(initialStart, 'year')) {
      refetch();
    }
  }, [params.startDateTime, refetch]);

  const allLogs = useMemo(() => data || [], [data]);
  const filteredLogs = useMemo(() => filterLogs(allLogs, params), [allLogs, params]);

  // Client-side pagination
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  const pagination = useMemo(() => ({
    page,
    limit: pageSize,
    total: totalItems,
    totalPages,
  }), [page, pageSize, totalItems, totalPages]);

  const handleFilterChange = useCallback((newParams: SystemLogQueryParams) => {
    setParams(newParams);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handlePaginationChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  }, []);

  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });
  const { setActions } = usePageActions();

  const headerActions = useMemo(() => (
    <Button
      variant="subtle"
      size="xs"
      onClick={handleRefresh}
      loading={isRefreshLoading}
    >
      {t('common:action.refresh', 'Refresh')}
    </Button>
  ), [t, isRefreshLoading, handleRefresh]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  return (
    <div>
      <SystemLogFilters
        params={params}
        onChange={handleFilterChange}
      />

      <DataTable
        data={paginatedLogs}
        columns={columns}
        pagination={pagination}
        isLoading={isLoading}
        emptyMessage={t('systemLogs:message.empty')}
        enableColumnVisibility={false}
        enableRowSelection={false}
        onPaginationChange={handlePaginationChange}
        compact
      />
    </div>
  );
}

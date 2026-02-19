import { useState, useMemo, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Text, Button } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { RoleBadge } from '@/components/common/RoleBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/date';
import { usePageActions } from '@/contexts/PageHeaderContext';
import { useRefresh } from '@/hooks/useRefresh';
import { useUserLogs } from '../hooks/useUserLogs';
import type { UserLog, ActionType, SortOrder } from '@/types';

const ACTION_TYPE_COLORS: Record<ActionType, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  RESET_PASSWORD: 'orange',
  CHANGE_PASSWORD: 'violet',
};

const columnHelper = createColumnHelper<UserLog>();

export function UserLogPage() {
  const { username } = useParams<{ username: string }>();
  const { t } = useTranslation(['users', 'common']);
  const navigate = useNavigate();
  const { setActions } = usePageActions();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('actionAt');
  const [order, setOrder] = useState<SortOrder>('desc');

  const { data, isLoading, refetch, isRefetching } = useUserLogs(username ?? '', {
    page,
    limit: 10,
    sort,
    order,
  });

  const { handleRefresh, isRefreshLoading } = useRefresh({ refetch, isRefetching });

  const columns = useMemo(
    () => [
      columnHelper.accessor('actionType', {
        header: t('users:logs.column.actionType'),
        enableHiding: false,
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          const color = ACTION_TYPE_COLORS[value];
          return (
            <Text size="sm" c={color} fw={500}>
              {t(`users:logs.actionType.${value}`)}
            </Text>
          );
        },
      }),
      columnHelper.accessor('actionAt', {
        header: t('users:logs.column.actionAt'),
        cell: ({ getValue }) => formatDateTime(getValue()),
      }),
      columnHelper.accessor('username', {
        header: t('users:logs.column.username'),
        enableSorting: false,
      }),
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'fullName',
        header: t('users:logs.column.fullName'),
        enableSorting: false,
      }),
      columnHelper.accessor('department', {
        header: t('users:logs.column.department'),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('section', {
        header: t('users:logs.column.section'),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('email', {
        header: t('users:logs.column.email'),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('tel', {
        header: t('users:logs.column.tel'),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('role', {
        header: t('users:logs.column.role'),
        enableSorting: false,
        cell: ({ row }) => <RoleBadge role={row.original.role} size="sm" />,
      }),
      columnHelper.accessor('status', {
        header: t('users:logs.column.status'),
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} size="sm" />,
      }),
      columnHelper.accessor('createdAt', {
        header: t('users:logs.column.createdAt'),
        enableSorting: false,
        cell: ({ getValue }) => formatDateTime(getValue()),
      }),
      columnHelper.accessor((row) => row.createdByName || row.createdBy, {
        id: 'createdBy',
        header: t('users:logs.column.createdBy'),
        enableSorting: false,
      }),
      columnHelper.accessor('updatedAt', {
        header: t('users:logs.column.updatedAt'),
        enableSorting: false,
        cell: ({ getValue }) => {
          const value = getValue();
          return value ? formatDateTime(value) : '-';
        },
      }),
      columnHelper.accessor((row) => row.updatedByName || row.updatedBy, {
        id: 'updatedBy',
        header: t('users:logs.column.updatedBy'),
        enableSorting: false,
        cell: ({ getValue }) => getValue() || '-',
      }),
    ],
    [t],
  );

  const sorting = useMemo(
    () => [{ id: sort, desc: order === 'desc' }],
    [sort, order],
  );

  const headerActions = useMemo(() => (
    <>
      <Button
        variant="subtle"
        size="xs"
        onClick={handleRefresh}
        loading={isRefreshLoading}
      >
        {t('common:action.refresh')}
      </Button>
      <Button
        variant="subtle"
        size="xs"
        onClick={() => navigate('/users')}
      >
        {t('users:logs.back')}
      </Button>
    </>
  ), [t, navigate, handleRefresh, isRefreshLoading]);

  useLayoutEffect(() => {
    setActions(headerActions);
    return () => setActions(null);
  }, [headerActions, setActions]);

  return (
    <div>
      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage={t('users:logs.empty')}
        sorting={sorting}
        onSortingChange={(newSorting) => {
          if (newSorting.length > 0) {
            setSort(newSorting[0].id);
            setOrder(newSorting[0].desc ? 'desc' : 'asc');
            setPage(1);
          }
        }}
        onPaginationChange={(newPage) => setPage(newPage)}
        scrollMinWidth={1800}
        compact
        withTopBorder
      />
    </div>
  );
}

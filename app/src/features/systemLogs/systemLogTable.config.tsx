import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import type { SystemLog, LogLevel } from './types';

const columnHelper = createColumnHelper<SystemLog>();

const LEVEL_COLORS: Record<LogLevel, string> = {
  info: 'blue',
  warn: 'yellow',
  error: 'red',
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'blue',
  POST: 'green',
  PUT: 'orange',
  PATCH: 'yellow',
  DELETE: 'red',
};

export function useSystemLogColumns() {
  const { t } = useTranslation(['systemLogs']);

  return useMemo(
    () => [
      columnHelper.accessor('level', {
        header: t('systemLogs:field.level'),
        size: 90,
        cell: ({ getValue }) => {
          const level = getValue();
          const color = LEVEL_COLORS[level] || 'gray';
          return (
            <Badge color={color} variant="light" radius="sm">
              {t(`systemLogs:level.${level}`)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('datetime', {
        header: t('systemLogs:field.datetime'),
        size: 150,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('username', {
        header: t('systemLogs:field.username'),
        size: 120,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('fullName', {
        header: t('systemLogs:field.fullName'),
        size: 140,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('ip', {
        header: t('systemLogs:field.ip'),
        size: 120,
        cell: ({ getValue }) => getValue() || '-',
      }),
      columnHelper.accessor('method', {
        header: t('systemLogs:field.method'),
        size: 90,
        cell: ({ getValue }) => {
          const method = getValue();
          if (!method) return '-';
          const color = METHOD_COLORS[method] || 'gray';
          return (
            <Badge color={color} variant="light" radius="sm">
              {method}
            </Badge>
          );
        },
      }),
      columnHelper.accessor('url', {
        header: t('systemLogs:field.url'),
        size: 250,
      }),
      columnHelper.accessor('event', {
        header: t('systemLogs:field.event'),
        size: 300,
      }),
    ],
    [t]
  );
}

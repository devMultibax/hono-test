import { useMemo } from 'react';
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  SimpleGrid,
  Badge,
  Flex,
  Box,
  Skeleton,
} from '@mantine/core';
import {
  RefreshCcw,
  Database as DatabaseIcon,
  HardDrive,
  Table2,
  LayoutList,
  Rows3,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useDatabaseStatistics, useDatabaseActions } from '../hooks/useDatabase';
import type { TableStat } from '../types';

const ICON_SIZE = 16;

export function DatabasePage() {
  const { t } = useTranslation(['database', 'common']);
  const { data: statistics, isLoading } = useDatabaseStatistics();
  const { handleAnalyze, isAnalyzing } = useDatabaseActions();

  const statsData = useMemo(
    () => [
      {
        icon: DatabaseIcon,
        label: t('database:stats.databaseName'),
        value: statistics?.databaseName,
        color: 'blue',
      },
      {
        icon: HardDrive,
        label: t('database:stats.databaseSize'),
        value: statistics?.totalSize,
        color: 'teal',
      },
      {
        icon: Rows3,
        label: t('database:stats.totalRows'),
        value: statistics?.totalRows?.toLocaleString(),
        color: 'orange',
      },
      {
        icon: LayoutList,
        label: t('database:stats.totalTables'),
        value: statistics?.totalTables,
        color: 'indigo',
      },
    ],
    [statistics, t],
  );

  return (
    <div>
      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<RefreshCcw size={ICON_SIZE} strokeWidth={3} />}
          onClick={handleAnalyze}
          loading={isAnalyzing}
        >
          {t('database:action.analyze')}
        </Button>
      </Group>

      <Stack gap="lg">
        {/* Database Info Cards */}
        <Paper p="md" radius="md" withBorder>
          {isLoading ? (
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} height={48} radius="sm" />
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md">
              {statsData.map((stat, idx) => (
                <Flex key={idx} gap="sm" align="center">
                  <stat.icon size={18} color={`var(--mantine-color-${stat.color}-6)`} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="xs" c="dimmed" truncate>
                      {stat.label}
                    </Text>
                    <Text fw={600} size="sm" truncate>
                      {stat.value ?? '-'}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </SimpleGrid>
          )}
        </Paper>

        {/* Tables List */}
        <Stack gap="xs">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} height={48} radius="md" />
            ))
          ) : statistics?.tables && statistics.tables.length > 0 ? (
            statistics.tables.map((table: TableStat, idx: number) => (
              <Paper key={idx} p="sm" radius="md" withBorder>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <Table2 size={18} color="var(--mantine-color-blue-6)" />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={600} size="sm" truncate>
                        {table.tableName}
                      </Text>
                    </Box>
                  </Group>

                  <Group gap="lg" wrap="nowrap">
                    <Flex gap={4} align="center">
                      <Rows3 size={14} color="var(--mantine-color-teal-6)" />
                      <Text size="sm" c="teal" fw={500}>
                        {table.rowCount.toLocaleString()}
                      </Text>
                    </Flex>

                    <Flex gap={4} align="center">
                      <HardDrive size={14} color="var(--mantine-color-violet-6)" />
                      <Text size="sm" c="violet" fw={500}>
                        {table.totalSize}
                      </Text>
                    </Flex>

                    <Badge size="sm" variant="light" color="blue">
                      #{idx + 1}
                    </Badge>
                  </Group>
                </Group>
              </Paper>
            ))
          ) : (
            <Paper p="xl" radius="md" withBorder>
              <Text c="dimmed" ta="center">
                {t('database:message.noTables')}
              </Text>
            </Paper>
          )}
        </Stack>
      </Stack>
    </div>
  );
}

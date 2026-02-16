import {
  Button,
  Group,
  SimpleGrid,
  Card,
  Text,
  Badge,
  Stack,
  Skeleton,
  ThemeIcon,
  Divider,
  Box,
  Tooltip,
} from '@mantine/core';
import {
  DatabaseBackup,
  HardDrive,
  Calendar,
  RefreshCcw,
  ArchiveRestore,
  FileArchive,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/date';
import { useBackups, useBackupActions } from '../hooks/useBackup';
import type { BackupType } from '../types';

const ICON_SIZE = 16;

const TYPE_CONFIG: Record<BackupType, { color: string; gradient: string }> = {
  yearly: { color: 'blue', gradient: 'linear-gradient(135deg, var(--mantine-color-blue-1) 0%, var(--mantine-color-indigo-1) 100%)' },
  daily: { color: 'green', gradient: 'linear-gradient(135deg, var(--mantine-color-green-1) 0%, var(--mantine-color-teal-1) 100%)' },
  manual: { color: 'orange', gradient: 'linear-gradient(135deg, var(--mantine-color-orange-1) 0%, var(--mantine-color-yellow-1) 100%)' },
};

export function BackupListPage() {
  const { t } = useTranslation(['backup', 'common']);
  const { data, isLoading } = useBackups();
  const { handleCreate, handleRestore, isCreating } = useBackupActions();

  const backups = data?.backups ?? [];

  return (
    <div>
      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<DatabaseBackup size={ICON_SIZE} strokeWidth={3} />}
          onClick={handleCreate}
          loading={isCreating}
        >
          {t('backup:action.create')}
        </Button>
      </Group>

      <Stack gap="md" mt="md">
        {isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} height={220} radius="md" />
            ))}
          </SimpleGrid>
        ) : backups.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
            {backups.map((backup) => {
              const config = TYPE_CONFIG[backup.type];
              return (
                <Card
                  key={backup.filename}
                  shadow="sm"
                  padding={0}
                  radius="md"
                  withBorder
                  style={{ overflow: 'hidden' }}
                >
                  {/* Gradient Header */}
                  <Box
                    px="md"
                    py="xs"
                    style={{ background: config.gradient }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <ThemeIcon
                          variant="light"
                          color={config.color}
                          size="md"
                          radius="md"
                        >
                          <FileArchive size={16} />
                        </ThemeIcon>
                        <Badge
                          color={config.color}
                          variant="filled"
                          size="md"
                          radius="sm"
                        >
                          {t(`backup:type.${backup.type}`)}
                        </Badge>
                      </Group>
                      <Badge
                        variant="light"
                        color="gray"
                        size="sm"
                        leftSection={<HardDrive size={10} />}
                      >
                        {backup.sizeFormatted}
                      </Badge>
                    </Group>
                  </Box>

                  {/* Body */}
                  <Stack gap="xs" px="md" py="sm">
                    {/* Filename */}
                    <Tooltip label={backup.filename} multiline maw={360}>
                      <Text
                        size="xs"
                        fw={600}
                        lineClamp={1}
                        style={{ wordBreak: 'break-all', cursor: 'default' }}
                      >
                        {backup.filename}
                      </Text>
                    </Tooltip>

                    <Divider />

                    {/* Info rows */}
                    <Stack gap={6}>
                      <Group gap={6}>
                        <ThemeIcon variant="light" color="orange" size="xs" radius="xl">
                          <Calendar size={10} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                          {t('backup:field.date')}
                        </Text>
                        <Text size="xs" fw={500}>
                          {formatDateTime(backup.date)}
                        </Text>
                      </Group>

                      <Group gap={6}>
                        <ThemeIcon variant="light" color="indigo" size="xs" radius="xl">
                          <RefreshCcw size={10} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                          {t('backup:field.modifiedAt')}
                        </Text>
                        <Text size="xs" fw={500}>
                          {formatDateTime(backup.modifiedAt)}
                        </Text>
                      </Group>

                      <Group gap={6}>
                        <ThemeIcon
                          variant="light"
                          color={backup.restoredAt ? 'violet' : 'gray'}
                          size="xs"
                          radius="xl"
                        >
                          <ArchiveRestore size={10} />
                        </ThemeIcon>
                        <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                          {t('backup:field.restoredAt')}
                        </Text>
                        <Text
                          size="xs"
                          fw={500}
                          c={backup.restoredAt ? undefined : 'dimmed'}
                          fs={backup.restoredAt ? undefined : 'italic'}
                        >
                          {backup.restoredAt
                            ? formatDateTime(backup.restoredAt)
                            : t('backup:message.neverRestored')}
                        </Text>
                      </Group>
                    </Stack>

                    {/* Restore Button */}
                    <Button
                      variant="light"
                      color={config.color}
                      size="xs"
                      leftSection={<ArchiveRestore size={12} />}
                      onClick={() => handleRestore(backup.filename)}
                      fullWidth
                      radius="md"
                      mt={4}
                    >
                      {t('backup:action.restore')}
                    </Button>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        ) : (
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <Stack align="center" gap="sm" py="md">
              <ThemeIcon variant="light" color="gray" size={50} radius="xl">
                <DatabaseBackup size={26} />
              </ThemeIcon>
              <Text ta="center" c="dimmed" size="sm">
                {t('backup:message.noBackups')}
              </Text>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
}

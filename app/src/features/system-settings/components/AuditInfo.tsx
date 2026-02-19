import { Group, Text, ThemeIcon } from '@mantine/core';
import { UserRound } from 'lucide-react';
import { formatRelative } from '@/lib/date';
import { useTranslation } from '@/lib/i18n';

interface AuditInfoProps {
  updatedBy?: string | null;
  updatedByName?: string | null;
  updatedAt?: string | null;
}

export function AuditInfo({ updatedByName, updatedBy, updatedAt }: AuditInfoProps) {
  const { t } = useTranslation(['systemSettings']);

  const displayName = updatedByName ?? updatedBy;

  if (!displayName || !updatedAt) {
    return (
      <Text size="xs" c="dimmed" fs="italic">
        {t('systemSettings:audit.noUpdate')}
      </Text>
    );
  }

  return (
    <Group gap={6} wrap="nowrap">
      <ThemeIcon size={16} variant="subtle" color="gray" radius="xl">
        <UserRound size={10} />
      </ThemeIcon>
      <Text size="xs" c="dimmed">
        {t('systemSettings:audit.lastUpdated', { name: displayName })}
        {' · '}
        {formatRelative(updatedAt)}
      </Text>
    </Group>
  );
}

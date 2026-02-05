import { Stack, Text, ThemeIcon } from '@mantine/core';
import { Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  message?: string;
  description?: string;
}

export function EmptyState({
  message,
  description
}: Props) {
  const { t } = useTranslation(['common']);

  return (
    <Stack align="center" py="xl" gap="sm">
      <ThemeIcon size={48} variant="light" color="gray">
        <Inbox size={24} />
      </ThemeIcon>
      <Text fw={500} c="dimmed">{message || t('common:empty.noData')}</Text>
      <Text size="sm" c="dimmed">{description || t('common:empty.tryChangeFilter')}</Text>
    </Stack>
  );
}

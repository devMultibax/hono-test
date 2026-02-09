import { Stack, Text, ThemeIcon, Box } from '@mantine/core';
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
    <Stack align="center" py={48} gap="md">
      <Box
        style={{
          borderRadius: '50%',
          backgroundColor: 'var(--mantine-color-gray-1)',
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ThemeIcon size={56} variant="light" color="gray" radius="xl">
          <Inbox size={28} />
        </ThemeIcon>
      </Box>
      <Text fw={500} c="dimmed" size="lg">{message || t('common:empty.noData')}</Text>
      <Text size="sm" c="dimmed">{description || t('common:empty.tryChangeFilter')}</Text>
    </Stack>
  );
}

import { Stack, Title, Text, Button, Paper } from '@mantine/core';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation(['errors', 'common']);

  const errorMessage = error instanceof Error
    ? error.message
    : t('errors:http.default');

  return (
    <Paper p="xl" className="text-center">
      <Stack align="center" gap="md">
        <AlertTriangle size={48} className="text-red-500" />
        <Title order={3}>{t('errors:title')}</Title>
        <Text c="dimmed" size="sm" className="max-w-md">
          {errorMessage}
        </Text>
        <Button
          leftSection={<RefreshCw size={16} />}
          onClick={resetErrorBoundary}
        >
          {t('common:button.reset')}
        </Button>
      </Stack>
    </Paper>
  );
}

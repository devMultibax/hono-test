import { Stack, Title, Text, Button, Paper } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error
    ? error.message
    : 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง';

  return (
    <Paper p="xl" className="text-center">
      <Stack align="center" gap="md">
        <IconAlertTriangle size={48} className="text-red-500" />
        <Title order={3}>เกิดข้อผิดพลาด</Title>
        <Text c="dimmed" size="sm" className="max-w-md">
          {errorMessage}
        </Text>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={resetErrorBoundary}
        >
          ลองใหม่
        </Button>
      </Stack>
    </Paper>
  );
}

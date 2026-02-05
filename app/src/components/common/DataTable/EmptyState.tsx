import { Stack, Text, ThemeIcon } from '@mantine/core';
import { Inbox } from 'lucide-react';

interface Props {
  message?: string;
  description?: string;
}

export function EmptyState({
  message = 'ไม่พบข้อมูล',
  description = 'ลองเปลี่ยนเงื่อนไขการค้นหา'
}: Props) {
  return (
    <Stack align="center" py="xl" gap="sm">
      <ThemeIcon size={48} variant="light" color="gray">
        <Inbox size={24} />
      </ThemeIcon>
      <Text fw={500} c="dimmed">{message}</Text>
      <Text size="sm" c="dimmed">{description}</Text>
    </Stack>
  );
}

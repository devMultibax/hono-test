import { Badge, type MantineColor } from '@mantine/core';
import type { Status } from '@/types';

interface Props {
  status: Status;
}

const statusConfig: Record<Status, { label: string; color: MantineColor }> = {
  active: { label: 'ใช้งาน', color: 'green' },
  inactive: { label: 'ไม่ใช้งาน', color: 'gray' },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
}

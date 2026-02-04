import { Badge, type MantineColor } from '@mantine/core';
import type { Role } from '@/types';

interface Props {
  role: Role;
}

const roleConfig: Record<Role, { label: string; color: MantineColor }> = {
  ADMIN: { label: 'Admin', color: 'red' },
  USER: { label: 'User', color: 'blue' },
};

export function RoleBadge({ role }: Props) {
  const config = roleConfig[role];
  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
}

import { Badge, type MantineColor } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import type { Role } from '@/types';

interface Props {
  role: Role;
}

const roleColorMap: Record<Role, MantineColor> = {
  ADMIN: 'red',
  USER: 'blue',
};

export function RoleBadge({ role }: Props) {
  const { t } = useTranslation('common');

  return (
    <Badge color={roleColorMap[role]} variant="light">
      {t(`role.${role}`)}
    </Badge>
  );
}

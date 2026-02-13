import { Group, ThemeIcon, Text, type MantineColor } from '@mantine/core';
import { IconShieldCheck, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n';
import type { Role } from '@/types';

interface Props {
  role: Role;
  size?: 'xs' | 'sm' | 'md';
}

const roleConfig: Record<Role, { color: MantineColor; icon: typeof IconUser }> = {
  ADMIN: { color: 'red', icon: IconShieldCheck },
  USER: { color: 'blue', icon: IconUser },
};

export function RoleBadge({ role, size = 'sm' }: Props) {
  const { t } = useTranslation('common');
  const { color, icon: Icon } = roleConfig[role];
  const iconSize = size === 'xs' ? 12 : 14;

  return (
    <Group gap={6} wrap="nowrap">
      <ThemeIcon variant="light" color={color} size={size}>
        <Icon size={iconSize} />
      </ThemeIcon>
      <Text size={size} fw={500} c={color}>
        {t(`role.${role.toLowerCase()}`)}
      </Text>
    </Group>
  );
}

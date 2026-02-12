import { Group, ThemeIcon, Text, type MantineColor } from '@mantine/core';
import { IconShieldCheck, IconUser } from '@tabler/icons-react';
import { useTranslation } from '@/lib/i18n';
import type { Role } from '@/types';

interface Props {
  role: Role;
}

const roleConfig: Record<Role, { color: MantineColor; icon: typeof IconUser }> = {
  ADMIN: { color: 'red', icon: IconShieldCheck },
  USER: { color: 'blue', icon: IconUser },
};

export function RoleBadge({ role }: Props) {
  const { t } = useTranslation('common');
  const { color, icon: Icon } = roleConfig[role];

  return (
    <Group gap={8} wrap="nowrap">
      <ThemeIcon variant="light" color={color} size="sm">
        <Icon size={14} />
      </ThemeIcon>
      <Text size="sm" fw={500} c={color}>
        {t(`role.${role.toLowerCase()}`)}
      </Text>
    </Group>
  );
}

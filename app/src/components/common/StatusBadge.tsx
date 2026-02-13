import { Box, Group, Text, type MantineColor } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import type { Status } from '@/types';

interface Props {
  status: Status;
  size?: 'xs' | 'sm' | 'md';
}

const statusColorMap: Record<Status, MantineColor> = {
  active: 'green',
  inactive: 'gray',
};

export function StatusBadge({ status, size = 'sm' }: Props) {
  const { t } = useTranslation('common');
  const color = statusColorMap[status];

  return (
    <Group gap={6} wrap="nowrap">
      <Box
        component="span"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: `var(--mantine-color-${color}-6)`,
          flexShrink: 0,
        }}
      />
      <Text size={size} c={color} fw={500}>
        {t(`status.${status}`)}
      </Text>
    </Group>
  );
}

import { Badge, Box, type MantineColor } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import type { Status } from '@/types';

interface Props {
  status: Status;
}

const statusColorMap: Record<Status, MantineColor> = {
  active: 'green',
  inactive: 'gray',
};

export function StatusBadge({ status }: Props) {
  const { t } = useTranslation('common');

  return (
    <Badge
      color={statusColorMap[status]}
      variant="light"
      radius="xl"
      leftSection={
        <Box
          component="span"
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: `var(--mantine-color-${statusColorMap[status]}-6)`,
          }}
        />
      }
    >
      {t(`status.${status}`)}
    </Badge>
  );
}

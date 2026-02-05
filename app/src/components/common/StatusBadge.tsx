import { Badge, type MantineColor } from '@mantine/core';
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
    <Badge color={statusColorMap[status]} variant="light">
      {t(`status.${status}`)}
    </Badge>
  );
}

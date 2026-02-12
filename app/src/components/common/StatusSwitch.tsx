import { Switch } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import type { Status } from '@/types';

interface Props {
  status: Status;
  onChange: (status: Status) => void;
  disabled?: boolean;
}

export function StatusSwitch({ status, onChange, disabled }: Props) {
  const checked = status === 'active';

  return (
    <Switch
      checked={checked}
      onChange={(e) => onChange(e.currentTarget.checked ? 'active' : 'inactive')}
      color="teal"
      size="sm"
      thumbIcon={
        checked
          ? <IconCheck size={12} color="var(--mantine-color-teal-6)" stroke={3} />
          : <IconX size={12} color="var(--mantine-color-red-6)" stroke={3} />
      }
      disabled={disabled}
    />
  );
}

import type { ReactNode } from 'react';
import { Grid, Stack, Text } from '@mantine/core';

interface InfoFieldProps {
  label: string;
  children: ReactNode;
  span?: { base: number; md: number };
}

export function InfoField({ label, children, span = { base: 12, md: 6 } }: InfoFieldProps) {
  return (
    <Grid.Col span={span}>
      <Stack gap="xs">
        <Text size="sm" c="dimmed">{label}</Text>
        <Text fw={500} component="div">{children}</Text>
      </Stack>
    </Grid.Col>
  );
}

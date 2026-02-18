import { Group, Title } from '@mantine/core';

interface Props {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: Props) {
  return (
    <Group justify="space-between" align="center" mb="xl">
      <Title order={2}>{title}</Title>
      {children && <Group gap="sm">{children}</Group>}
    </Group>
  );
}

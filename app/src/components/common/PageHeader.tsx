import { Group, Title, Breadcrumbs, Anchor, Stack, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Props {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, children }: Props) {
  return (
    <Stack gap="sm" mb="xl">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<ChevronRight size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />}
          separatorMargin={6}
        >
          {breadcrumbs.map((item, index) => (
            item.path ? (
              <Anchor key={index} component={Link} to={item.path} size="sm" c="dimmed">
                {item.label}
              </Anchor>
            ) : (
              <Text key={index} size="sm" c="dimmed">{item.label}</Text>
            )
          ))}
        </Breadcrumbs>
      )}

      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
        {children && <Group gap="sm">{children}</Group>}
      </Group>
    </Stack>
  );
}

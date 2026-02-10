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
      <Group justify="space-between" align="center">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<ChevronRight size={14} style={{ color: 'var(--mantine-color-gray-6)' }} />}
            separatorMargin={8}
          >
            {breadcrumbs.map((item, index) => (
              item.path ? (
                <Anchor key={index} component={Link} to={item.path} size="md" c="blue.6" fw={500}>
                  {item.label}
                </Anchor>
              ) : (
                <Text key={index} size="md" c="dark.7" fw={600}>{item.label}</Text>
              )
            ))}
          </Breadcrumbs>
        )}
        <Title order={2}>{title}</Title>
      </Group>
      {children && <Group gap="sm">{children}</Group>}
    </Stack>
  );
}

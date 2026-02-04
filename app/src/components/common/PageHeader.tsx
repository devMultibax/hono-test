import { Group, Title, Breadcrumbs, Anchor, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';

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
    <Stack gap="xs" mb="lg">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          {breadcrumbs.map((item, index) => (
            item.path ? (
              <Anchor key={index} component={Link} to={item.path} size="sm">
                {item.label}
              </Anchor>
            ) : (
              <span key={index}>{item.label}</span>
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

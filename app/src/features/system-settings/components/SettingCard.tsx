import { type ReactNode } from 'react';
import { Paper, Group, Stack, Text, ThemeIcon, Divider, Box, Skeleton } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';

interface SettingCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  headerRight?: ReactNode;
  isLoading?: boolean;
}

export function SettingCard({
  icon: Icon,
  iconColor = 'blue',
  title,
  description,
  children,
  headerRight,
  isLoading = false,
}: SettingCardProps) {
  if (isLoading) {
    return (
      <Paper withBorder radius="md" shadow="xs" p="lg">
        <Group gap="md" mb={children ? 'md' : 0}>
          <Skeleton circle height={40} />
          <Stack gap={6} style={{ flex: 1 }}>
            <Skeleton height={16} w="30%" radius="sm" />
            <Skeleton height={12} w="60%" radius="sm" />
          </Stack>
        </Group>
        {children && <Skeleton height={80} radius="sm" />}
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" shadow="xs" p="lg">
      <Group justify="space-between" align="flex-start" mb={children ? 'md' : 0}>
        <Group gap="md" align="flex-start">
          <ThemeIcon size={40} variant="light" color={iconColor} radius="md" style={{ flexShrink: 0 }}>
            <Icon size={20} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={600} size="sm">
              {title}
            </Text>
            {description && (
              <Text size="xs" c="dimmed" maw={520}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>
        {headerRight && <Box style={{ flexShrink: 0 }}>{headerRight}</Box>}
      </Group>

      {children && (
        <>
          <Divider mb="md" />
          {children}
        </>
      )}
    </Paper>
  );
}

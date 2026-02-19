import { type ReactNode } from 'react';
import { Stack, Text, Box, Flex, Divider } from '@mantine/core';
import type { LucideIcon } from 'lucide-react';

interface SettingRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  /** Control rendered flush-right on the same line as the label (e.g. Switch) */
  control?: ReactNode;
  /** Content rendered full-width below the label row (e.g. Textarea) */
  children?: ReactNode;
  showDivider?: boolean;
}

export function SettingRow({
  icon: Icon,
  label,
  description,
  control,
  children,
  showDivider = false,
}: SettingRowProps) {
  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap="lg">
        {/* Left: icon + label + description */}
        <Flex gap="sm" align="flex-start" style={{ flex: 1, minWidth: 0 }}>
          {Icon && (
            <Box mt={2} style={{ flexShrink: 0 }}>
              <Icon size={15} color="var(--mantine-color-dimmed)" />
            </Box>
          )}
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={500}>
              {label}
            </Text>
            {description && (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            )}
          </Stack>
        </Flex>

        {/* Right: inline control (e.g. Switch) */}
        {control && <Box style={{ flexShrink: 0 }}>{control}</Box>}
      </Flex>

      {/* Full-width children rendered below the label row */}
      {children && <Box mt="sm">{children}</Box>}

      {showDivider && <Divider mt="md" />}
    </Box>
  );
}

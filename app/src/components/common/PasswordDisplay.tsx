import { TextInput, Text, Group, CopyButton, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface PasswordDisplayProps {
  username: string;
  password: string;
  usernameLabel?: string;
  passwordLabel?: string;
}

export function PasswordDisplay({ username, password, usernameLabel, passwordLabel }: PasswordDisplayProps) {
  const { t } = useTranslation('common');

  return (
    <Stack gap="md">
      <TextInput label={usernameLabel ?? t('common:label.username')} value={username} readOnly />

      <div>
        <Text size="sm" fw={500} mb={4}>{passwordLabel ?? t('common:label.password')}</Text>
        <Group gap="xs">
          <TextInput value={password} readOnly style={{ flex: 1 }} />
          <CopyButton value={password}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? t('common:action.copied') : t('common:action.copy')}>
                <ActionIcon color={copied ? 'teal' : 'gray'} variant="light" onClick={copy} size="lg">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </div>
    </Stack>
  );
}

import { useState } from 'react';
import { Drawer, Modal, Button, Text, TextInput, Group, Stack, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { Copy, Check } from 'lucide-react';
import { UserForm } from './UserForm';
import { useCreateUser } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import type { CreateUserRequest } from '@/types';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function UserCreateDrawer({ opened, onClose }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const createUser = useCreateUser();
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = (data: CreateUserRequest) => {
    createUser.mutate(data, {
      onSuccess: (res) => setCredentials({ username: data.username, password: res.data.password }),
    });
  };

  const handleClose = () => {
    if (credentials) {
      setCredentials(null);
    }
    onClose();
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={t('users:page.createTitle')}
        position="right"
        size="lg"
      >
        <UserForm onSubmit={handleSubmit} onCancel={handleClose} isLoading={createUser.isPending} />
      </Drawer>

      <Modal
        opened={!!credentials}
        onClose={handleClose}
        title={t('users:message.createSuccess')}
        centered
        closeOnClickOutside={false}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">{t('users:message.savePasswordWarning')}</Text>

          <TextInput label={t('users:field.username')} value={credentials?.username ?? ''} readOnly />

          <div>
            <Text size="sm" fw={500} mb={4}>{t('users:field.password')}</Text>
            <Group gap="xs">
              <TextInput value={credentials?.password ?? ''} readOnly style={{ flex: 1 }} />
              <CopyButton value={credentials?.password ?? ''}>
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

          <Button onClick={handleClose} fullWidth>{t('common:button.close')}</Button>
        </Stack>
      </Modal>
    </>
  );
}

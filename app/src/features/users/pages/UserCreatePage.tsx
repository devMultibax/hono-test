import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Text, TextInput, Group, Stack, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import type { CreateUserRequest } from '@/types';

export function UserCreatePage() {
  const { t } = useTranslation(['users', 'common', 'navigation']);
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = (data: CreateUserRequest) => {
    createUser.mutate(data, {
      onSuccess: (res) => setCredentials({ username: data.username, password: res.data.password }),
    });
  };

  const handleClose = () => {
    setCredentials(null);
    navigate('/users');
  };

  return (
    <div>
      <PageHeader
        title={t('users:page.createTitle')}
        breadcrumbs={[
          { label: t('navigation:breadcrumb.home'), path: '/dashboard' },
          { label: t('navigation:breadcrumb.users'), path: '/users' },
          { label: t('navigation:breadcrumb.createUser') },
        ]}
      />

      <UserForm onSubmit={handleSubmit} isLoading={createUser.isPending} />

      <Modal opened={!!credentials} onClose={handleClose} title={t('users:message.createSuccess')} centered closeOnClickOutside={false}>
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
    </div>
  );
}

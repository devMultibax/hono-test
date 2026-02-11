import { useState } from 'react';
import { Drawer, Modal, Button, Text, Stack } from '@mantine/core';
import type { AxiosResponse } from 'axios';
import { PasswordDisplay } from '@/components/common/PasswordDisplay';
import { UserForm } from './UserForm';
import { useCreateUser } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import type { CreateUserRequest } from '../types';
import type { CreateUserResponse } from '@/types';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function UserCreateDrawer({ opened, onClose }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const { confirm } = useConfirm();
  const createUser = useCreateUser();
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = (data: CreateUserRequest) => {
    confirm({
      title: t('users:confirm.create.title'),
      message: t('users:confirm.create.message', { username: data.username }),
      onConfirm: () => {
        createUser.mutate(data, {
          onSuccess: (res) => {
            const response = res as AxiosResponse<CreateUserResponse>;
            setCredentials({ username: data.username, password: response.data.password });
          },
        });
      },
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

          <PasswordDisplay
            username={credentials?.username ?? ''}
            password={credentials?.password ?? ''}
            usernameLabel={t('users:field.username')}
            passwordLabel={t('users:field.password')}
          />

          <Button onClick={handleClose} fullWidth>{t('common:button.close')}</Button>
        </Stack>
      </Modal>
    </>
  );
}

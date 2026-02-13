import { useState } from 'react';
import { Drawer, Modal, Button, Text, Stack, Grid, Group } from '@mantine/core';
import type { AxiosResponse } from 'axios';
import { DrawerForm } from '@/components/common/DrawerForm';
import { PasswordDisplay } from '@/components/common/PasswordDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { InfoField } from '@/components/common/InfoField';
import { UserForm } from './UserForm';
import { useUser, useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { formatDateTime } from '@/lib/date';
import type { UserDrawerState, CreateUserRequest, UpdateUserRequest } from '../types';
import type { CreateUserResponse } from '@/types';

interface Props {
  state: UserDrawerState;
  onClose: () => void;
  onEdit: (userId: number) => void;
}

export function UserDrawer({ state, onClose, onEdit }: Props) {
  const userId = 'userId' in state ? state.userId : 0;

  if (state.mode === 'create') {
    return <CreateContent opened onClose={onClose} />;
  }

  if (state.mode === 'edit') {
    return <EditContent opened userId={userId} onClose={onClose} />;
  }

  if (state.mode === 'detail') {
    return <DetailContent opened userId={userId} onClose={onClose} onEdit={onEdit} />;
  }

  return null;
}

// --- Create ---

function CreateContent({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation(['users', 'common']);
  const { confirm } = useConfirm();
  const createUser = useCreateUser();
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  const handleSubmit = async (data: CreateUserRequest) => {
    const confirmed = await confirm({
      title: t('users:confirm.create.title'),
      message: t('users:confirm.create.message', { name: `${data.firstName} ${data.lastName}` }),
    });
    if (!confirmed) return;

    const res = await createUser.mutateAsync(data);
    const response = res as AxiosResponse<CreateUserResponse>;
    setCredentials({ username: data.username, password: response.data.password });
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

// --- Edit ---

function EditContent({ opened, userId, onClose }: { opened: boolean; userId: number; onClose: () => void }) {
  const { t } = useTranslation(['users']);
  const { confirm } = useConfirm();
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = async (data: UpdateUserRequest) => {
    const userName = `${user?.firstName} ${user?.lastName}`;

    const confirmed = await confirm({
      title: t('users:confirm.update.title'),
      message: t('users:confirm.update.message', { name: userName }),
    });
    if (!confirmed) return;

    await updateUser.mutateAsync({ id: userId, data });
    onClose();
  };

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('users:page.editTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('users:message.userNotFound')}
    >
      {user && (
        <UserForm initialData={user} onSubmit={handleSubmit} onCancel={onClose} isLoading={updateUser.isPending} />
      )}
    </DrawerForm>
  );
}

// --- Detail ---

function DetailContent({ opened, userId, onClose, onEdit }: { opened: boolean; userId: number; onClose: () => void; onEdit: (userId: number) => void }) {
  const { t } = useTranslation(['users', 'common']);
  const userRole = useUserRole();
  const canEdit = hasRole([ROLE_ID.ADMIN], userRole);
  const { data: user, isLoading, error } = useUser(userId);

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('users:page.detailTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('users:message.userNotFound')}
    >
      {user && (
        <Stack gap="md">
          <Grid>
            <InfoField label={t('users:field.username')}>{user.username}</InfoField>
            <InfoField label={t('users:field.role')}><RoleBadge role={user.role} /></InfoField>
            <InfoField label={t('users:field.status')}><StatusBadge status={user.status} /></InfoField>
            <InfoField label={t('users:field.lastLoginAt')}>
              {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-'}
            </InfoField>
          </Grid>

          <Grid>
            <InfoField label={t('users:field.firstName')}>{user.firstName}</InfoField>
            <InfoField label={t('users:field.lastName')}>{user.lastName}</InfoField>
            <InfoField label={t('users:field.email')}>{user.email || '-'}</InfoField>
            <InfoField label={t('users:field.tel')}>{user.tel || '-'}</InfoField>
          </Grid>

          <Grid>
            <InfoField label={t('users:field.department')}>{user.department?.name || '-'}</InfoField>
            <InfoField label={t('users:field.section')}>{user.section?.name || '-'}</InfoField>
          </Grid>

          <Grid>
            <InfoField label={t('common:field.createdAt')}>{formatDateTime(user.createdAt)}</InfoField>
            <InfoField label={t('common:field.createdBy')}>{user.createdBy}</InfoField>
            {user.updatedAt && (
              <>
                <InfoField label={t('common:field.updatedAt')}>{formatDateTime(user.updatedAt)}</InfoField>
                <InfoField label={t('common:field.updatedBy')}>{user.updatedBy || '-'}</InfoField>
              </>
            )}
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              {t('common:button.close')}
            </Button>
            {canEdit && (
              <Button onClick={() => onEdit(userId)}>
                {t('common:button.edit')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </DrawerForm>
  );
}

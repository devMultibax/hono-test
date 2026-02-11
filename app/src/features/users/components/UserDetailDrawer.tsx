import type { ReactNode } from 'react';
import { Drawer, LoadingOverlay, Alert, Stack, Grid, Text, Button, Group } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { useUser } from '../hooks/useUsers';
import { useIsAdmin } from '@/stores/auth.store';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/date';

function InfoField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Stack gap="xs">
        <Text size="sm" c="dimmed">{label}</Text>
        <Text fw={500} component="div">{children}</Text>
      </Stack>
    </Grid.Col>
  );
}

interface Props {
  opened: boolean;
  onClose: () => void;
  userId: number;
  onEdit: (userId: number) => void;
}

export function UserDetailDrawer({ opened, onClose, userId, onEdit }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const isAdmin = useIsAdmin();
  const { data: user, isLoading, error } = useUser(userId);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('users:page.detailTitle')}
      position="right"
      size="lg"
    >
      <LoadingOverlay visible={isLoading} />

      {error || (!isLoading && !user) ? (
        <Alert icon={<AlertCircle size={16} />} color="red">
          {t('users:message.userNotFound')}
        </Alert>
      ) : user && (
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
            {isAdmin && (
              <Button onClick={() => onEdit(userId)}>
                {t('common:button.edit')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Drawer>
  );
}

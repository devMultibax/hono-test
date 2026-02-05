import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, LoadingOverlay, Alert, Stack, Grid, Text, Button, Divider } from '@mantine/core';
import { AlertCircle, Edit } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
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

export function UserDetailPage() {
  const { t } = useTranslation(['users', 'common', 'navigation']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);
  const isAdmin = useIsAdmin();

  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <LoadingOverlay visible />;

  if (error || !user) {
    return (
      <Alert icon={<AlertCircle size={16} />} color="red">
        {t('users:message.userNotFound')}
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title={t('users:page.detailTitle')}
        breadcrumbs={[
          { label: t('navigation:breadcrumb.home'), path: '/dashboard' },
          { label: t('navigation:breadcrumb.users'), path: '/users' },
          { label: t('navigation:breadcrumb.detail') },
        ]}
      >
        {isAdmin && (
          <Button leftSection={<Edit size={16} />} onClick={() => navigate(`/users/${userId}/edit`)}>
            {t('common:button.edit')}
          </Button>
        )}
      </PageHeader>

      <Paper p="lg" withBorder>
        <Stack gap="lg">
          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:section.accountInfo')}</h3>
            <Grid>
              <InfoField label={t('users:field.username')}>{user.username}</InfoField>
              <InfoField label={t('users:field.role')}><RoleBadge role={user.role} /></InfoField>
              <InfoField label={t('users:field.status')}><StatusBadge status={user.status} /></InfoField>
              <InfoField label={t('users:field.lastLoginAt')}>
                {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-'}
              </InfoField>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:section.personalInfo')}</h3>
            <Grid>
              <InfoField label={t('users:field.firstName')}>{user.firstName}</InfoField>
              <InfoField label={t('users:field.lastName')}>{user.lastName}</InfoField>
              <InfoField label={t('users:field.email')}>{user.email || '-'}</InfoField>
              <InfoField label={t('users:field.tel')}>{user.tel || '-'}</InfoField>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:section.affiliation')}</h3>
            <Grid>
              <InfoField label={t('users:field.department')}>{user.department?.name || '-'}</InfoField>
              <InfoField label={t('users:field.section')}>{user.section?.name || '-'}</InfoField>
            </Grid>
          </section>

          <Divider />

          <section>
            <h3 className="text-lg font-medium mb-4">{t('users:section.systemInfo')}</h3>
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
          </section>
        </Stack>
      </Paper>
    </div>
  );
}

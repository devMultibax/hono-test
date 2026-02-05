import { useNavigate, useParams } from 'react-router-dom';
import { LoadingOverlay, Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { UserForm } from '../components/UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import type { UpdateUserRequest } from '@/types';

export function UserEditPage() {
  const { t } = useTranslation(['users', 'common', 'navigation']);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  const handleSubmit = (data: UpdateUserRequest) => {
    updateUser.mutate({ id: userId, data }, { onSuccess: () => navigate('/users') });
  };

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
        title={t('users:page.editTitle')}
        breadcrumbs={[
          { label: t('navigation:breadcrumb.home'), path: '/dashboard' },
          { label: t('navigation:breadcrumb.users'), path: '/users' },
          { label: t('navigation:breadcrumb.editUser') },
        ]}
      />

      <UserForm initialData={user} onSubmit={handleSubmit} isLoading={updateUser.isPending} />
    </div>
  );
}

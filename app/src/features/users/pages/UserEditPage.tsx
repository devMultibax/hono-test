import { useNavigate, useParams } from 'react-router-dom';
import { LoadingOverlay, Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { UserForm } from '../components/UserForm';
import { useUser, useUpdateUser } from '../hooks/useUsers';
import type { UpdateUserRequest } from '@/types';

export function UserEditPage() {
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
        ไม่พบข้อมูลผู้ใช้
      </Alert>
    );
  }

  return (
    <div>
      <PageHeader
        title="แก้ไขผู้ใช้"
        breadcrumbs={[
          { label: 'หน้าหลัก', path: '/dashboard' },
          { label: 'ผู้ใช้งาน', path: '/users' },
          { label: 'แก้ไขผู้ใช้' },
        ]}
      />

      <UserForm initialData={user} onSubmit={handleSubmit} isLoading={updateUser.isPending} />
    </div>
  );
}

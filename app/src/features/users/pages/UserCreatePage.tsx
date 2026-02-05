import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Text, TextInput, Group, Stack, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { UserForm } from '../components/UserForm';
import { useCreateUser } from '../hooks/useUsers';
import type { CreateUserRequest } from '@/types';

export function UserCreatePage() {
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
        title="เพิ่มผู้ใช้"
        breadcrumbs={[
          { label: 'หน้าหลัก', path: '/dashboard' },
          { label: 'ผู้ใช้งาน', path: '/users' },
          { label: 'เพิ่มผู้ใช้' },
        ]}
      />

      <UserForm onSubmit={handleSubmit} isLoading={createUser.isPending} />

      <Modal opened={!!credentials} onClose={handleClose} title="สร้างผู้ใช้สำเร็จ" centered closeOnClickOutside={false}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">กรุณาบันทึกรหัสผ่านนี้ เนื่องจากจะไม่สามารถดูได้อีกครั้ง</Text>

          <TextInput label="Username" value={credentials?.username ?? ''} readOnly />

          <div>
            <Text size="sm" fw={500} mb={4}>รหัสผ่าน</Text>
            <Group gap="xs">
              <TextInput value={credentials?.password ?? ''} readOnly style={{ flex: 1 }} />
              <CopyButton value={credentials?.password ?? ''}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'คัดลอกแล้ว' : 'คัดลอก'}>
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="light" onClick={copy} size="lg">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </div>

          <Button onClick={handleClose} fullWidth>ปิด</Button>
        </Stack>
      </Modal>
    </div>
  );
}

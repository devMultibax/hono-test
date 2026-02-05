import { useState } from 'react';
import { Modal, Stack, Button, Text, Alert, TextInput, Group, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { AlertTriangle, Copy, Check } from 'lucide-react';
import { useResetPassword } from '../hooks/useUsers';
import type { User } from '@/types';

interface Props {
  user: User;
  opened: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ user, opened, onClose }: Props) {
  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState('');

  const isReset = !!newPassword;

  const handleReset = () => {
    resetPassword.mutate(user.id, {
      onSuccess: (res) => setNewPassword(res.data.password),
    });
  };

  const handleClose = () => {
    setNewPassword('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isReset ? 'รีเซ็ตรหัสผ่านสำเร็จ' : 'รีเซ็ตรหัสผ่าน'}
      centered
      closeOnClickOutside={!isReset}
    >
      <Stack gap="md">
        {!isReset ? (
          <>
            <Alert icon={<AlertTriangle size={16} />} color="yellow" variant="light">
              <Text size="sm">
                คุณกำลังรีเซ็ตรหัสผ่านสำหรับ <strong>{user.firstName} {user.lastName}</strong>
              </Text>
              <Text size="sm" mt="xs">ระบบจะสร้างรหัสผ่านใหม่ให้อัตโนมัติ</Text>
            </Alert>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={handleClose}>ยกเลิก</Button>
              <Button onClick={handleReset} loading={resetPassword.isPending}>ยืนยันรีเซ็ตรหัสผ่าน</Button>
            </Group>
          </>
        ) : (
          <>
            <Alert color="green" variant="light">
              <Text size="sm">รีเซ็ตรหัสผ่านสำเร็จ กรุณาบันทึกรหัสผ่านนี้ เนื่องจากจะไม่สามารถดูได้อีกครั้ง</Text>
            </Alert>

            <TextInput label="Username" value={user.username} readOnly />

            <div>
              <Text size="sm" fw={500} mb={4}>รหัสผ่านใหม่</Text>
              <Group gap="xs">
                <TextInput value={newPassword} readOnly style={{ flex: 1 }} />
                <CopyButton value={newPassword}>
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
          </>
        )}
      </Stack>
    </Modal>
  );
}

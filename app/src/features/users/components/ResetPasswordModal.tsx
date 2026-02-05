import { useState } from 'react';
import { Modal, Stack, Button, Text, Alert, TextInput, Group, CopyButton, ActionIcon, Tooltip } from '@mantine/core';
import { AlertTriangle, Copy, Check } from 'lucide-react';
import { useResetPassword } from '../hooks/useUsers';
import { useTranslation } from '@/lib/i18n';
import type { User } from '@/types';

interface Props {
  user: User;
  opened: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ user, opened, onClose }: Props) {
  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const { t } = useTranslation(['users', 'common']);

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
      title={isReset ? t('users:resetPassword.successTitle') : t('users:resetPassword.title')}
      centered
      closeOnClickOutside={!isReset}
    >
      <Stack gap="md">
        {!isReset ? (
          <>
            <Alert icon={<AlertTriangle size={16} />} color="yellow" variant="light">
              <Text size="sm">
                {t('users:resetPassword.warning')} <strong>{user.firstName} {user.lastName}</strong>
              </Text>
              <Text size="sm" mt="xs">{t('users:resetPassword.autoGenerate')}</Text>
            </Alert>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={handleClose}>{t('users:resetPassword.button.cancel')}</Button>
              <Button onClick={handleReset} loading={resetPassword.isPending}>{t('users:resetPassword.button.confirm')}</Button>
            </Group>
          </>
        ) : (
          <>
            <Alert color="green" variant="light">
              <Text size="sm">{t('users:resetPassword.saveWarning')}</Text>
            </Alert>

            <TextInput label={t('common:label.username')} value={user.username} readOnly />

            <div>
              <Text size="sm" fw={500} mb={4}>{t('users:resetPassword.newPassword')}</Text>
              <Group gap="xs">
                <TextInput value={newPassword} readOnly style={{ flex: 1 }} />
                <CopyButton value={newPassword}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? t('users:resetPassword.copy.success') : t('users:resetPassword.copy.label')}>
                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="light" onClick={copy} size="lg">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </div>

            <Button onClick={handleClose} fullWidth>{t('users:resetPassword.button.close')}</Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}

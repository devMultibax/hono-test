import { Modal, Stack, Button, Text, Alert } from '@mantine/core';
import { PasswordDisplay } from '@/components/common/PasswordDisplay';
import { useTranslation } from '@/lib/i18n';

interface Props {
  username: string;
  password: string;
  opened: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ username, password, opened, onClose }: Props) {
  const { t } = useTranslation(['users', 'common']);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('users:resetPassword.successTitle')}
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <Alert color="green" variant="light">
          <Text size="sm">{t('users:resetPassword.saveWarning')}</Text>
        </Alert>

        <PasswordDisplay
          username={username}
          password={password}
          passwordLabel={t('users:resetPassword.newPassword')}
        />

        <Button onClick={onClose} fullWidth>{t('users:resetPassword.button.close')}</Button>
      </Stack>
    </Modal>
  );
}

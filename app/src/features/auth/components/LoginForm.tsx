import { TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const { t } = useTranslation(['auth', 'validation']);

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => {
        if (!v) return t('validation:required.username');
        if (v.length !== 6) return t('validation:format.usernameLength');
        if (!/^[a-zA-Z0-9]+$/.test(v)) return t('validation:format.usernamePattern');
        return null;
      },
      password: (v) => {
        if (!v) return t('validation:required.password');
        if (v.length < 6) return t('validation:format.passwordMinLength');
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  return (
    <form onSubmit={form.onSubmit(login)}>
      <Stack gap="md">
        <TextInput
          label={t('auth:login.username.label')}
          placeholder={t('auth:login.username.placeholder')}
          leftSection={<User size={16} />}
          maxLength={6}
          {...form.getInputProps('username')}
        />

        <PasswordInput
          label={t('auth:login.password.label')}
          placeholder={t('auth:login.password.placeholder')}
          leftSection={<Lock size={16} />}
          {...form.getInputProps('password')}
        />

        <Button type="submit" fullWidth loading={isLoggingIn} mt="sm">
          {t('auth:login.button')}
        </Button>
      </Stack>
    </form>
  );
}

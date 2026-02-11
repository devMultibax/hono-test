import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Button, Stack, Text, Checkbox, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { User, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import { extractErrorMessage } from '@/utils/errorHandlerUtils';
import { Report } from '@/utils/alertUtils';

const REMEMBER_KEY = 'remembered_username';

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const { t } = useTranslation(['auth', 'validation']);
  const [remember, setRemember] = useState(false);

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => {
        if (!v) return t('validation:required.employeeId');
        if (v.length !== 6) return t('validation:format.employeeIdLength');
        if (!/^[a-zA-Z0-9]+$/.test(v)) return t('validation:format.employeeIdDigits');
        return null;
      },
      password: (v) => {
        if (!v) return t('validation:required.password');
        if (v.length < 8) return t('validation:format.passwordMinLength');
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  // Load remembered username on mount
  useEffect(() => {
    const rememberedUsername = localStorage.getItem(REMEMBER_KEY);
    if (rememberedUsername) {
      form.setFieldValue('username', rememberedUsername);
      setRemember(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    // Save or clear remembered username
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, values.username);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
    try {
      await login(values);
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 401) {
        Report.warning(extractErrorMessage(err));
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 py-10">
      <Stack gap="xl">
        {/* Header */}
        <div className="text-center">
          <Text
            size="32px"
            fw={700}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          >
            {t('auth:app.title')}
          </Text>
          <Text size="sm" c="dimmed" mt={8}>
            {t('auth:login.subtitle')}
          </Text>
        </div>

        {/* Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              placeholder={t('auth:login.username.placeholder')}
              leftSection={<User size={16} />}
              maxLength={6}
              size="md"
              disabled={isLoggingIn}
              autoComplete="username"
              {...form.getInputProps('username')}
            />

            <PasswordInput
              placeholder={t('auth:login.password.placeholder')}
              leftSection={<Lock size={16} />}
              size="md"
              disabled={isLoggingIn}
              autoComplete="current-password"
              {...form.getInputProps('password')}
            />

            {/* Remember Me */}
            <Group justify="space-between">
              <Checkbox
                label={t('auth:login.rememberMe')}
                checked={remember}
                onChange={(e) => setRemember(e.currentTarget.checked)}
                disabled={isLoggingIn}
              />
            </Group>

            <Button type="submit" fullWidth size="md" loading={isLoggingIn} mt="sm">
              {t('auth:login.button')}
            </Button>
          </Stack>
        </form>

        {/* Footer */}
        <Text size="xs" c="dimmed" ta="center">
          &copy; {new Date().getFullYear()} {t('auth:app.company')}
        </Text>
      </Stack>
    </div>
  );
}

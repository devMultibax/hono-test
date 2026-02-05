import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Paper, Title, Stack, Alert, Center, Box } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';
import { useTranslation } from '@/lib/i18n';
import type { AxiosError } from 'axios';

export function LoginPage() {
  const { isAuthenticated, loginError, fetchCsrfToken } = useAuth();
  const { t } = useTranslation(['auth', 'errors']);

  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Paper shadow="md" p="xl" radius="md" className="w-full max-w-md">
        <Stack gap="lg">
          <Center>
            <Title order={2}>{t('auth:login.title')}</Title>
          </Center>

          {loginError && (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {(loginError as AxiosError<{ message?: string }>)?.response?.data?.message || t('errors:http.default')}
            </Alert>
          )}

          <LoginForm />
        </Stack>
      </Paper>
    </Box>
  );
}
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Paper, Title, Stack, Alert, Center, Box } from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated, loginError, fetchCsrfToken } = useAuth();

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
            <Title order={2}>เข้าสู่ระบบ</Title>
          </Center>

          {loginError && (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {(loginError as any)?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'}
            </Alert>
          )}

          <LoginForm />
        </Stack>
      </Paper>
    </Box>
  );
}
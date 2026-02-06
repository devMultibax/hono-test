import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box } from '@mantine/core';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated, fetchCsrfToken } = useAuth();

  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box className="min-h-svh flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </Box>
  );
}
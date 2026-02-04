import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/services/auth.api';
import { showSuccess } from '@/api/error-handler';
import type { LoginRequest } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setCsrfToken, logout: clearAuth, user, isAuthenticated } = useAuthStore();

  const fetchCsrfToken = useCallback(async () => {
    const { data } = await authApi.getCsrfToken();
    setCsrfToken(data.csrfToken);
    return data.csrfToken;
  }, [setCsrfToken]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      await fetchCsrfToken();
      return authApi.login(credentials);
    },
    onSuccess: ({ data }) => {
      setUser(data.user);
      showSuccess('เข้าสู่ระบบสำเร็จ');
      navigate('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      showSuccess('ออกจากระบบสำเร็จ');
      navigate('/login');
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });

  const isAdmin = user?.role === 'ADMIN';

  return {
    user,
    isAuthenticated,
    isAdmin,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    fetchCsrfToken,
  };
}
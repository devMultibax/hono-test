import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/api/client';
import type { LoginRequest } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginError, setLoginError] = useState<Error | null>(null);
  const { user, isAuthenticated, setUser, setCsrfToken, logout: logoutStore } = useAuthStore();

  const fetchCsrfToken = useCallback(async () => {
    try {
      const res = await apiClient.get('/auth/csrf-token');
      setCsrfToken(res.data.csrfToken);
    } catch (err) {
      console.error('Failed to fetch CSRF token:', err);
    }
  }, [setCsrfToken]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const res = await apiClient.post('/auth/login', credentials);
        setUser(res.data.user);
        navigate('/dashboard');
      } catch (err) {
        setLoginError(err as Error);
        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [navigate, setUser]
  );

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      logoutStore();
      setIsLoggingOut(false);
      navigate('/login');
    }
  }, [logoutStore, navigate]);

  return { user, isAuthenticated, login, logout, isLoggingIn, isLoggingOut, loginError, fetchCsrfToken };
}

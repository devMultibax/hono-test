import { useState } from 'react';
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

  const fetchCsrfToken = async () => {
    try {
      const response = await apiClient.get('/auth/csrf-token');
      setCsrfToken(response.data.csrfToken);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (error) {
      setLoginError(error as Error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logoutStore();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoggingIn,
    isLoggingOut,
    loginError,
    fetchCsrfToken,
  };
}

import { useAuthStore } from '@/stores/auth.store';
import { t } from '@/lib/i18n/helpers';

export interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      error?: string;
      requiresLogin?: boolean;
    };
    status?: number;
  };
  message?: string;
}

function isErrorResponse(error: unknown): error is ErrorResponse {
  return typeof error === 'object' && error !== null;
}

export function extractErrorMessage(error: unknown): string {
  if (!error) return t('errors:http.default');
  if (typeof error === 'string') return error;
  if (!isErrorResponse(error)) return t('errors:http.default');

  console.log('error', error.response);

  return error.response?.data?.message
    || error.response?.data?.error
    || error.message
    || t('errors:http.default');
}

function redirectToLogin(): void {
  useAuthStore.getState().logout();
  window.location.href = '/login';
}

export function handleErrorMode(error: unknown): {
  mode: 'error' | 'warning';
  message: string;
  onConfirm?: () => void;
} {
  const message = extractErrorMessage(error);

  if (!isErrorResponse(error)) {
    return { mode: 'error', message };
  }

  const isServerError = error.response?.status === 500;
  const needsReLogin = error.response?.data?.requiresLogin === true;

  return {
    mode: isServerError || needsReLogin ? 'error' : 'warning',
    message,
    onConfirm: needsReLogin ? redirectToLogin : undefined,
  };
}

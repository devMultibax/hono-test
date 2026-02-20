import { useAuthStore } from '@/stores/auth.store';
import { t, i18n } from '@/lib/i18n/helpers';

export interface ErrorResponse {
  response?: {
    data?: {
      error?: {
        code?: string;
        message?: string;
        details?: Record<string, unknown>;
        requiresLogin?: boolean;
        maintenance?: boolean;
      };
    };
    status?: number;
  };
  message?: string;
}

function isErrorResponse(error: unknown): error is ErrorResponse {
  return typeof error === 'object' && error !== null;
}

/**
 * แปลง error code จาก API response เป็นข้อความภาษาไทย (หรือภาษาอื่นตาม locale)
 * Fallback chain: error code → HTTP status code → default message
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return t('errors:http.default');
  if (typeof error === 'string') return error;
  if (!isErrorResponse(error)) return t('errors:http.default');

  const errorObj = error.response?.data?.error;
  const errorCode = errorObj?.code;
  const details = errorObj?.details;
  const status = error.response?.status;

  // 1. ลองแปลจาก error code
  if (errorCode) {
    const key = `api:${errorCode}` as const;
    if (i18n.exists(key)) {
      return t(key, details ?? {});
    }
  }

  // 2. Fallback เป็น HTTP status code
  if (status) {
    const httpKey = `errors:http.${status}` as const;
    if (i18n.exists(httpKey)) {
      return t(httpKey);
    }
  }

  // 3. Fallback สุดท้าย
  return t('errors:http.default');
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
  const needsReLogin = error.response?.data?.error?.requiresLogin === true;

  return {
    mode: isServerError || needsReLogin ? 'error' : 'warning',
    message,
    onConfirm: needsReLogin ? redirectToLogin : undefined,
  };
}

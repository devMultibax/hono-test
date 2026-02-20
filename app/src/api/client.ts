import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { handleApiError } from './error-handler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;
const MUTATING_METHODS = ['post', 'put', 'patch', 'delete'];

let refreshPromise: Promise<string | null> | null = null;
let isHandling401 = false;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach CSRF token to mutating requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { csrfToken } = useAuthStore.getState();
  if (csrfToken && MUTATING_METHODS.includes(config.method ?? '')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Refresh CSRF token (singleton pattern)
async function refreshCsrfToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = axios
    .get(`${API_URL}/auth/csrf-token`, { withCredentials: true })
    .then((res) => {
      const token = res.data.csrfToken;
      useAuthStore.getState().setCsrfToken(token);
      return token;
    })
    .catch(() => null)
    .finally(() => (refreshPromise = null));

  return refreshPromise;
}

function isCsrfError(err: AxiosError<{ error?: string }>): boolean {
  return err.response?.status === 403 && (err.response?.data?.error ?? '').toLowerCase().includes('csrf');
}

// Handle errors and auto-retry CSRF failures
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const err = error as AxiosError<{ error?: string }>;
    const config = err.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Auto-retry on CSRF error
    if (isCsrfError(err) && config && !config._retry) {
      config._retry = true;
      const token = await refreshCsrfToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
        return apiClient(config);
      }
    }

    // Redirect to login on 401 (guard against multiple concurrent 401s)
    if (err.response?.status === 401 && !isHandling401) {
      isHandling401 = true;
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      isHandling401 = false;
      return Promise.reject(error);
    }

    // Redirect to maintenance page on 503 maintenance response
    const responseData = err.response?.data as { maintenance?: boolean } | undefined;
    if (err.response?.status === 503 && responseData?.maintenance === true) {
      if (window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    handleApiError(err);
    return Promise.reject(error);
  }
);

export async function downloadFile(url: string, filename: string, signal?: AbortSignal, params?: Record<string, unknown>) {
  const res = await apiClient.get(url, { responseType: 'blob', signal, params });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([res.data]));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

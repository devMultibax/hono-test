import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { handleApiError } from './error-handler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { csrfToken } = useAuthStore.getState();

    const mutatingMethods = ['post', 'put', 'patch', 'delete'];
    if (csrfToken && mutatingMethods.includes(config.method || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const axiosError = error as AxiosError<unknown>;

    if (axiosError.response?.status === 401) {
      useAuthStore.getState().logout();

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    handleApiError(axiosError);

    return Promise.reject(error);
  }
);

export const downloadFile = async (url: string, filename: string) => {
  const response = await apiClient.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

import type { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { X } from 'lucide-react';
import { t } from '@/lib/i18n/helpers';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: AxiosError<unknown>): string {
  const status = error.response?.status;
  const data = error.response?.data as ApiErrorResponse | undefined;
  const message = data?.message || error.message;

  if (status === 401) return message;

  // Use server message for specific status codes if available, otherwise use translation
  const getErrorMessage = (statusCode: number) => {
    const hasServerMessage = [400, 409, 422].includes(statusCode) && message;
    if (hasServerMessage) return message;

    const key = `errors:http.${statusCode}`;
    return t(key, { defaultValue: message || t('errors:http.default') });
  };

  const displayMessage = status ? getErrorMessage(status) : (message || t('errors:http.default'));

  notifications.show({
    title: t('errors:title'),
    message: displayMessage,
    color: 'red',
    icon: <X size={16} />,
  });

  return displayMessage;
}

export function showSuccess(message: string, title = t('errors:notification.success')) {
  notifications.show({
    title,
    message,
    color: 'green',
  });
}

export function showWarning(message: string, title = t('errors:notification.warning')) {
  notifications.show({
    title,
    message,
    color: 'yellow',
  });
}
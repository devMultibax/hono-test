import type { AxiosError } from 'axios';
import { handleError } from '@/utils/mantineAlertUtils';

export { handleError };

export function handleApiError(error: AxiosError<unknown>): void {
  // 401 is handled separately (interceptor redirects or LoginForm catches it)
  if (error.response?.status === 401) return;

  handleError(error);
}

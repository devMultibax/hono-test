import axios, { type AxiosError } from 'axios';
import { handleError } from '@/utils/mantineAlertUtils';

export { handleError };

export function handleApiError(error: AxiosError<unknown>): void {
  // Cancelled requests are handled by the caller (e.g. ExportDrawer)
  if (axios.isCancel(error)) return;

  // 401 is handled separately (interceptor redirects or LoginForm catches it)
  if (error.response?.status === 401) return;

  // 503 maintenance is handled separately (interceptor redirects to /maintenance)
  const data = error.response?.data as { maintenance?: boolean } | undefined;
  if (error.response?.status === 503 && data?.maintenance === true) return;

  handleError(error);
}

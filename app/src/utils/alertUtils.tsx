import Notiflix from 'notiflix';
import { t } from '@/lib/i18n/helpers';
import { handleErrorMode } from './errorHandlerUtils';

const TOAST_OPTIONS = {
  position: 'right-top' as const,
  timeout: 6000,
};

export const Toast = {
  success: (message: string) => Notiflix.Notify.success(message, TOAST_OPTIONS),
  error: (message: string) => Notiflix.Notify.failure(message, TOAST_OPTIONS),
  warning: (message: string) => Notiflix.Notify.warning(message, TOAST_OPTIONS),
  info: (message: string) => Notiflix.Notify.info(message, TOAST_OPTIONS),
};

export const Report = {
  success: (message: string, callback?: () => void) =>
    Notiflix.Report.success(
      t('errors:notification.success'),
      message,
      t('common:notiflix.ok'),
      callback,
    ),
  error: (message: string, callback?: () => void) =>
    Notiflix.Report.failure(
      t('errors:notification.error'),
      message,
      t('common:notiflix.ok'),
      callback,
    ),
  warning: (message: string, callback?: () => void) =>
    Notiflix.Report.warning(
      t('errors:notification.warning'),
      message,
      t('common:notiflix.ok'),
      callback,
    ),
  info: (message: string, callback?: () => void) =>
    Notiflix.Report.info(
      t('common:notiflix.info'),
      message,
      t('common:notiflix.ok'),
      callback,
    ),
};

export const Confirm = {
  show: (message: string, title?: string): Promise<boolean> =>
    new Promise((resolve) => {
      Notiflix.Confirm.show(
        title || t('common:notiflix.confirmTitle'),
        message,
        t('common:button.confirm'),
        t('common:button.cancel'),
        () => resolve(true),
        () => resolve(false),
      );
    }),
};

export function handleError(error: unknown): void {
  const { mode, message, onConfirm } = handleErrorMode(error);

  if (mode === 'error') {
    Report.error(message, onConfirm);
  } else {
    Report.warning(message);
  }
}

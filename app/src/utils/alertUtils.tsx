import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Text, Alert, Stack } from '@mantine/core';
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { t } from '@/lib/i18n/helpers';
import { handleErrorMode } from './errorHandlerUtils';

// Toast Notifications
const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 6000,
  withCloseButton: true,
};

export const Toast = {
  success: (message: string) => {
    notifications.show({
      ...TOAST_OPTIONS,
      title: t('errors:notification.success'),
      message,
      color: 'teal',
      icon: <IconCheck size={20} />,
    });
  },

  error: (message: string) => {
    notifications.show({
      ...TOAST_OPTIONS,
      title: t('errors:notification.error'),
      message,
      color: 'red',
      icon: <IconX size={20} />,
    });
  },

  warning: (message: string) => {
    notifications.show({
      ...TOAST_OPTIONS,
      title: t('errors:notification.warning'),
      message,
      color: 'yellow',
      icon: <IconAlertTriangle size={20} />,
    });
  },

  info: (message: string) => {
    notifications.show({
      ...TOAST_OPTIONS,
      title: t('common:notiflix.info'),
      message,
      color: 'blue',
      icon: <IconInfoCircle size={20} />,
    });
  },
};

// Report Modals
export const Report = {
  success: (message: string, callback?: () => void) => {
    modals.openConfirmModal({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mantine-color-teal-6)' }}>
          <IconCheck size={24} />
          <span>{t('errors:notification.success')}</span>
        </div>
      ),
      children: <Text size="sm">{message}</Text>,
      centered: true,
      labels: { confirm: t('common:notiflix.ok'), cancel: t('common:button.cancel') },
      confirmProps: { color: 'teal' },
      cancelProps: { display: 'none' },
      onConfirm: callback,
    });
  },

  error: (message: string, callback?: () => void) => {
    modals.openConfirmModal({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mantine-color-red-6)' }}>
          <IconX size={24} />
          <span>{t('errors:notification.error')}</span>
        </div>
      ),
      children: <Text size="sm">{message}</Text>,
      centered: true,
      labels: { confirm: t('common:notiflix.ok'), cancel: t('common:button.cancel') },
      confirmProps: { color: 'red' },
      cancelProps: { display: 'none' },
      onConfirm: callback,
    });
  },

  warning: (message: string, callback?: () => void) => {
    modals.openConfirmModal({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mantine-color-yellow-6)' }}>
          <IconAlertTriangle size={24} />
          <span>{t('errors:notification.warning')}</span>
        </div>
      ),
      children: <Text size="sm">{message}</Text>,
      centered: true,
      labels: { confirm: t('common:notiflix.ok'), cancel: t('common:button.cancel') },
      confirmProps: { color: 'yellow' },
      cancelProps: { display: 'none' },
      onConfirm: callback,
    });
  },

  info: (message: string, callback?: () => void) => {
    modals.openConfirmModal({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mantine-color-blue-6)' }}>
          <IconInfoCircle size={24} />
          <span>{t('common:notiflix.info')}</span>
        </div>
      ),
      children: <Text size="sm">{message}</Text>,
      centered: true,
      labels: { confirm: t('common:notiflix.ok'), cancel: t('common:button.cancel') },
      confirmProps: { color: 'blue' },
      cancelProps: { display: 'none' },
      onConfirm: callback,
    });
  },
};

// Confirm Dialog
export const Confirm = {
  show: (message: string, title?: string): Promise<boolean> =>
    new Promise((resolve) => {
      modals.openConfirmModal({
        title: title || t('common:notiflix.confirmTitle'),
        children: <Text size="sm">{message}</Text>,
        centered: true,
        labels: {
          confirm: t('common:button.confirm'),
          cancel: t('common:button.cancel'),
        },
        confirmProps: { color: 'blue' },
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    }),

  delete: (itemName: string, options?: { title?: string; description?: string }): Promise<boolean> =>
    new Promise((resolve) => {
      modals.openConfirmModal({
        title: options?.title || t('common:confirm.delete.title'),
        children: (
          <Stack gap="md">
            <Alert icon={<IconTrash size={16} />} color="red" variant="light">
              <Text size="sm">
                {t('common:confirm.delete.message', { itemName })}
              </Text>
              {options?.description && (
                <Text size="sm" mt="xs" c="dimmed">
                  {options.description}
                </Text>
              )}
            </Alert>
          </Stack>
        ),
        centered: true,
        labels: {
          confirm: t('common:confirm.delete.confirm'),
          cancel: t('common:button.cancel'),
        },
        confirmProps: { color: 'red' },
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    }),
};

// Error Handler
export function handleError(error: unknown): void {
  const { mode, message, onConfirm } = handleErrorMode(error);

  if (mode === 'error') {
    Report.error(message, onConfirm);
  } else {
    Report.warning(message);
  }
}

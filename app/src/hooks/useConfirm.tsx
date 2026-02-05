import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirm() {
  const { t } = useTranslation(['common']);

  const confirm = ({
    title = t('common:confirm.title'),
    message,
    confirmLabel = t('common:confirm.confirm'),
    cancelLabel = t('common:confirm.cancel'),
    confirmColor = 'red',
    onConfirm,
    onCancel,
  }: ConfirmOptions) => {
    modals.openConfirmModal({
      title,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: confirmLabel, cancel: cancelLabel },
      confirmProps: { color: confirmColor },
      onConfirm,
      onCancel,
    });
  };

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    confirm({
      title: t('common:confirm.delete.title'),
      message: t('common:confirm.delete.message', { itemName }),
      confirmLabel: t('common:confirm.delete.confirm'),
      onConfirm,
    });
  };

  return { confirm, confirmDelete };
}

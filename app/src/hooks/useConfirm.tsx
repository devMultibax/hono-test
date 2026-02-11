import { useTranslation } from 'react-i18next';
import { Confirm } from '@/utils/alertUtils';

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

  const confirm = async ({
    title = t('common:confirm.title'),
    message,
    onConfirm,
    onCancel,
  }: ConfirmOptions) => {
    const result = await Confirm.show(message, title);
    if (result) {
      await onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  };

  const confirmDelete = async (itemName: string, onConfirm: () => void | Promise<void>) => {
    const result = await Confirm.delete(itemName, {
      title: t('common:confirm.delete.title'),
    });
    if (result) {
      await onConfirm();
    }
  };

  return { confirm, confirmDelete };
}

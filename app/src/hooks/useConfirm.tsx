import { useTranslation } from 'react-i18next';
import { Confirm } from '@/utils/alertUtils';

interface ConfirmOptions {
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirm() {
  const { t } = useTranslation(['common']);

  const confirm = async ({
    title,
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

  const confirmDelete = async (
    itemName: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      title?: string;
      message?: string;
      description?: string;
    }
  ) => {
    const msg = options?.message
      || `${t('common:confirm.delete.messagePrefix')} ${itemName} ${t('common:confirm.delete.messageSuffix')}`;
    const result = await Confirm.show(
      msg,
      options?.title || t('common:confirm.delete.title'),
    );
    if (result) {
      await onConfirm();
    }
  };

  const confirmWarning = async (
    itemName: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      title?: string;
      message?: string;
      description?: string;
    }
  ) => {
    const msg = options?.message || itemName;
    const result = await Confirm.show(
      msg,
      options?.title || t('common:confirm.title'),
    );
    if (result) {
      await onConfirm();
    }
  };

  return { confirm, confirmDelete, confirmWarning };
}

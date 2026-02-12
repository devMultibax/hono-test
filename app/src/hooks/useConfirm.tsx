import { Confirm } from '@/utils/mantineAlertUtils';

interface ConfirmOptions {
  title?: string;
  message: string;
  note?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirm() {
  const confirm = async ({
    title,
    message,
    note,
    onConfirm,
    onCancel,
  }: ConfirmOptions) => {
    const result = await Confirm.show({ message, title, note });
    if (result) {
      await onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  };

  return { confirm };
}

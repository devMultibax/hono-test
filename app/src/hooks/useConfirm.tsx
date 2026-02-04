import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

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
  const confirm = ({
    title = 'ยืนยันการดำเนินการ',
    message,
    confirmLabel = 'ยืนยัน',
    cancelLabel = 'ยกเลิก',
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
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบ "${itemName}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      confirmLabel: 'ลบ',
      onConfirm,
    });
  };

  return { confirm, confirmDelete };
}

import { Confirm } from '@/utils/mantineAlertUtils';

interface ConfirmOptions {
  title?: string;
  message: string;
  note?: string;
}

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return Confirm.show(options);
  };

  return { confirm };
}

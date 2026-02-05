import type { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { X } from 'lucide-react';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: AxiosError<unknown>): string {
  const status = error.response?.status;
  const data = error.response?.data as ApiErrorResponse | undefined;
  const message = data?.message || error.message;

  if (status === 401) return message;

  const errorMessages: Record<number, string> = {
    400: message || 'ข้อมูลไม่ถูกต้อง',
    403: 'คุณไม่มีสิทธิ์ดำเนินการนี้',
    404: 'ไม่พบข้อมูลที่ต้องการ',
    409: message || 'ข้อมูลซ้ำในระบบ',
    422: message || 'ข้อมูลไม่ผ่านการตรวจสอบ',
    429: 'คำขอมากเกินไป กรุณารอสักครู่',
    500: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
    503: 'ระบบไม่พร้อมให้บริการ',
  };

  const displayMessage = errorMessages[status || 0] || message || 'เกิดข้อผิดพลาด';

  notifications.show({
    title: 'เกิดข้อผิดพลาด',
    message: displayMessage,
    color: 'red',
    icon: <X size={16} />,
  });

  return displayMessage;
}

export function showSuccess(message: string, title = 'สำเร็จ') {
  notifications.show({
    title,
    message,
    color: 'green',
  });
}

export function showWarning(message: string, title = 'คำเตือน') {
  notifications.show({
    title,
    message,
    color: 'yellow',
  });
}
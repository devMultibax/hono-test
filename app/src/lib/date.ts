import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(buddhistEra);
dayjs.extend(relativeTime);
dayjs.locale('th');

export const formatDate = (date: string | Date, format = 'DD/MM/BBBB') => dayjs(date).format(format);

export const formatDateTime = (date: string | Date, format = 'DD/MM/BBBB HH:mm') => dayjs(date).format(format);

export const formatTime = (date: string | Date, format = 'HH:mm') => dayjs(date).format(format);

export const formatRelative = (date: string | Date) => dayjs(date).fromNow();

export const formatDateRange = (start: Date | null, end: Date | null) => {
  if (!start) return '';
  return end ? `${formatDate(start)} - ${formatDate(end)}` : formatDate(start);
};

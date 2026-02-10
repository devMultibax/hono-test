import type { UserQueryParams } from '@/types';

export const DEFAULT_PARAMS: UserQueryParams = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
};

// Map column id → DB field for sorting (column id ที่ไม่ตรงกับ field ใน DB)
export const SORT_FIELD_MAP: Record<string, string> = { fullName: 'firstName' };
export const SORT_FIELD_REVERSE: Record<string, string> = { firstName: 'fullName' };

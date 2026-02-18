import type { TFunction } from 'i18next';

export const ROLE_ID = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export type RoleId = (typeof ROLE_ID)[keyof typeof ROLE_ID];

export const getRoleOptions = (t: TFunction) => [
  { value: ROLE_ID.USER, label: t('common:role.user') },
  { value: ROLE_ID.ADMIN, label: t('common:role.admin') },
];
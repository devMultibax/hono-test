import type { TFunction } from 'i18next'

export const getRoleOptions = (t: TFunction) => [
  { value: 'USER', label: t('common:role.user') },
  { value: 'ADMIN', label: t('common:role.admin') },
]

export const getStatusOptions = (t: TFunction) => [
  { value: 'active', label: t('common:status.active') },
  { value: 'inactive', label: t('common:status.inactive') },
]

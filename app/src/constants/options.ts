import type { TFunction } from 'i18next'

export { getRoleOptions } from './roleConstants'

export const getStatusOptions = (t: TFunction) => [
  { value: 'active', label: t('common:status.active') },
  { value: 'inactive', label: t('common:status.inactive') },
]

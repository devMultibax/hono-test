import type { TFunction } from 'i18next';
import type { Changelog, CreateChangelogRequest, UpdateChangelogRequest, ChangelogQueryParams, UpdateType } from '@/types';

export type { Changelog, CreateChangelogRequest, UpdateChangelogRequest, ChangelogQueryParams, UpdateType };

export type ChangelogDrawerState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'detail'; changelogId: number }
  | { mode: 'edit'; changelogId: number };

export interface ChangelogFormValues {
  title: string;
  description: string;
  updateType: UpdateType;
  gitRef: string;
  updatedDate: Date | null;
}

// === Shared Constants ===

export const UPDATE_TYPE_COLORS: Record<UpdateType, string> = {
  FEATURE: 'blue',
  BUGFIX: 'red',
  IMPROVEMENT: 'green',
  SECURITY: 'orange',
  OTHER: 'gray',
};

export const getUpdateTypeOptions = (t: TFunction) => [
  { value: 'FEATURE', label: t('changelogs:updateType.FEATURE') },
  { value: 'BUGFIX', label: t('changelogs:updateType.BUGFIX') },
  { value: 'IMPROVEMENT', label: t('changelogs:updateType.IMPROVEMENT') },
  { value: 'SECURITY', label: t('changelogs:updateType.SECURITY') },
  { value: 'OTHER', label: t('changelogs:updateType.OTHER') },
];

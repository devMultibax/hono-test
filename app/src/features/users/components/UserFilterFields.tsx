import { Select } from '@mantine/core';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import { getRoleOptions, getStatusOptions } from '@/constants/options';
import type { Role, Status } from '../types';

interface FilterValues {
  departmentId?: number;
  sectionId?: number;
  role?: Role;
  status?: Status;
}

interface UserFilterFieldsProps {
  values: FilterValues;
  onUpdate: (patch: Partial<FilterValues>) => void;
}

export function UserFilterFields({ values, onUpdate }: UserFilterFieldsProps) {
  const { t } = useTranslation(['users', 'common']);

  const ROLE_OPTIONS = getRoleOptions(t);
  const STATUS_OPTIONS = getStatusOptions(t);

  return (
    <>
      <DepartmentSelect
        label={t('common:label.department')}
        value={values.departmentId ?? null}
        onChange={(departmentId) => onUpdate({ departmentId: departmentId ?? undefined, sectionId: undefined })}
        placeholder={t('users:filter.allDepartments')}
      />

      <SectionSelect
        label={t('common:label.section')}
        departmentId={values.departmentId ?? null}
        value={values.sectionId ?? null}
        onChange={(sectionId) => onUpdate({ sectionId: sectionId ?? undefined })}
        placeholder={t('users:filter.allSections')}
      />

      <Select
        label={t('common:label.role')}
        placeholder={t('users:filter.allRoles')}
        value={values.role ?? null}
        onChange={(role) => onUpdate({ role: (role as Role) || undefined })}
        data={ROLE_OPTIONS}
        clearable
      />

      <Select
        label={t('common:label.status')}
        placeholder={t('users:filter.allStatuses')}
        value={values.status ?? null}
        onChange={(status) => onUpdate({ status: (status as Status) || undefined })}
        data={STATUS_OPTIONS}
        clearable
      />
    </>
  );
}

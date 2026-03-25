import { Paper, SimpleGrid, Select } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import { getRoleOptions, getStatusOptions } from '@/constants/options';
import { useUserPermissions } from '../hooks/useUserPermissions';
import type { UserQueryParams, Role, Status } from '../types';

// --- Filter Fields (shared between UserFilters and UserExportDrawer) ---

interface FilterValues {
  departmentId?: number;
  sectionId?: number;
  role?: Role;
  status?: Status;
}

interface UserFilterFieldsProps {
  values: FilterValues;
  onUpdate: (patch: Partial<FilterValues>) => void;
  userDepartmentIds?: number[];
}

export function UserFilterFields({ values, onUpdate, userDepartmentIds }: UserFilterFieldsProps) {
  const { t } = useTranslation(['users', 'common']);
  const { canFilterByRole, canViewAllDepartments } = useUserPermissions();

  const ROLE_OPTIONS = getRoleOptions(t);
  const STATUS_OPTIONS = getStatusOptions(t);

  return (
    <>
      <DepartmentSelect
        label={t('common:label.department')}
        value={values.departmentId ?? null}
        onChange={(departmentId) => onUpdate({ departmentId: departmentId ?? undefined, sectionId: undefined })}
        placeholder={t('users:filter.allDepartments')}
        includeIds={!canViewAllDepartments ? userDepartmentIds : undefined}
      />

      <SectionSelect
        label={t('common:label.section')}
        departmentId={values.departmentId ?? null}
        value={values.sectionId ?? null}
        onChange={(sectionId) => onUpdate({ sectionId: sectionId ?? undefined })}
        placeholder={t('users:filter.allSections')}
      />

      {canFilterByRole && (
        <Select
          label={t('common:label.role')}
          placeholder={t('users:filter.allRoles')}
          value={values.role ?? null}
          onChange={(role) => onUpdate({ role: (role as Role) || undefined })}
          data={ROLE_OPTIONS}
          clearable
        />
      )}

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

// --- Main Filter Panel ---

interface Props {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
  userDepartmentIds?: number[];
}

export function UserFilters({ params, onChange, userDepartmentIds }: Props) {
  const { t } = useTranslation(['users']);
  const update = (patch: Partial<UserQueryParams>) => onChange({ ...params, ...patch });

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
        <SearchInput
          label={t('users:filter.searchLabel')}
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder={t('users:filter.searchPlaceholder')}
        />

        <UserFilterFields values={params} onUpdate={update} userDepartmentIds={userDepartmentIds} />
      </SimpleGrid>
    </Paper>
  );
}

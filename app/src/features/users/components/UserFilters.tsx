import { Paper, SimpleGrid, Select } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import { getRoleOptions, getStatusOptions } from '@/constants/options';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import type { UserQueryParams, Role, Status } from '../types';

// --- Filter Config ---

type FilterId = 'department' | 'section' | 'role' | 'status';

interface FilterFieldConfig {
  id: FilterId;
  allowedRoles: readonly RoleId[];
}

const FILTER_FIELDS: FilterFieldConfig[] = [
  { id: 'department', allowedRoles: [ROLE_ID.ADMIN] },
  { id: 'section', allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER] },
  { id: 'role', allowedRoles: [ROLE_ID.ADMIN] },
  { id: 'status', allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER] },
];

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
  currentUserRole: RoleId;
  userDepartmentId?: number;
}

export function UserFilterFields({ values, onUpdate, currentUserRole, userDepartmentId }: UserFilterFieldsProps) {
  const { t } = useTranslation(['users', 'common']);

  const visibleFilters = FILTER_FIELDS.filter((field) =>
    hasRole(field.allowedRoles, currentUserRole),
  );
  const visible = new Set(visibleFilters.map((f) => f.id));

  const ROLE_OPTIONS = getRoleOptions(t);
  const STATUS_OPTIONS = getStatusOptions(t);

  return (
    <>
      {visible.has('department') && (
        <DepartmentSelect
          label={t('common:label.department')}
          value={values.departmentId ?? null}
          onChange={(departmentId) => onUpdate({ departmentId: departmentId ?? undefined, sectionId: undefined })}
          placeholder={t('users:filter.allDepartments')}
        />
      )}

      {visible.has('section') && (
        <SectionSelect
          label={t('common:label.section')}
          departmentId={values.departmentId ?? userDepartmentId ?? null}
          value={values.sectionId ?? null}
          onChange={(sectionId) => onUpdate({ sectionId: sectionId ?? undefined })}
          placeholder={t('users:filter.allSections')}
        />
      )}

      {visible.has('role') && (
        <Select
          label={t('common:label.role')}
          placeholder={t('users:filter.allRoles')}
          value={values.role ?? null}
          onChange={(role) => onUpdate({ role: (role as Role) || undefined })}
          data={ROLE_OPTIONS}
          clearable
        />
      )}

      {visible.has('status') && (
        <Select
          label={t('common:label.status')}
          placeholder={t('users:filter.allStatuses')}
          value={values.status ?? null}
          onChange={(status) => onUpdate({ status: (status as Status) || undefined })}
          data={STATUS_OPTIONS}
          clearable
        />
      )}
    </>
  );
}

// --- Main Filter Panel ---

interface Props {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
  currentUserRole: RoleId;
  userDepartmentId?: number;
}

export function UserFilters({ params, onChange, currentUserRole, userDepartmentId }: Props) {
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

        <UserFilterFields values={params} onUpdate={update} currentUserRole={currentUserRole} userDepartmentId={userDepartmentId} />
      </SimpleGrid>
    </Paper>
  );
}

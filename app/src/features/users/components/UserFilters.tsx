import { Paper, SimpleGrid, Select, Title } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import type { UserQueryParams } from '@/types';

interface Props {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
}

export function UserFilters({ params, onChange }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const update = (patch: Partial<UserQueryParams>) => onChange({ ...params, ...patch });

  const ROLE_OPTIONS = [
    { value: 'USER', label: t('users:role.user') },
    { value: 'ADMIN', label: t('users:role.admin') },
  ];

  const STATUS_OPTIONS = [
    { value: 'active', label: t('users:status.active') },
    { value: 'inactive', label: t('users:status.inactive') },
  ];

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <Title order={5} size="h6" mb="md" c="dimmed">{t('users:filter.title')}</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
        <SearchInput
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder={t('users:filter.searchPlaceholder')}
        />

        <DepartmentSelect
          value={params.departmentId ?? null}
          onChange={(departmentId) => update({ departmentId: departmentId ?? undefined, sectionId: undefined })}
          placeholder={t('users:filter.allDepartments')}
        />

        <SectionSelect
          departmentId={params.departmentId ?? null}
          value={params.sectionId ?? null}
          onChange={(sectionId) => update({ sectionId: sectionId ?? undefined })}
          placeholder={t('users:filter.allSections')}
        />

        <Select
          placeholder={t('users:filter.allRoles')}
          value={params.role ?? null}
          onChange={(role) => update({ role: (role as 'USER' | 'ADMIN') || undefined })}
          data={ROLE_OPTIONS}
          clearable
        />

        <Select
          placeholder={t('users:filter.allStatuses')}
          value={params.status ?? null}
          onChange={(status) => update({ status: (status as 'active' | 'inactive') || undefined })}
          data={STATUS_OPTIONS}
          clearable
        />
      </SimpleGrid>
    </Paper>
  );
}

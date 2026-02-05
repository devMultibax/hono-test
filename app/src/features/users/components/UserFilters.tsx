import { Paper, Group, Select } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import type { UserQueryParams } from '@/types';

interface Props {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
}

const ROLE_OPTIONS = [
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'ใช้งาน' },
  { value: 'inactive', label: 'ไม่ใช้งาน' },
];

export function UserFilters({ params, onChange }: Props) {
  const update = (patch: Partial<UserQueryParams>) => onChange({ ...params, ...patch });

  return (
    <Paper p="md" mb="md" withBorder>
      <Group>
        <SearchInput
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder="ค้นหาชื่อ, username..."
        />

        <DepartmentSelect
          value={params.departmentId ?? null}
          onChange={(departmentId) => update({ departmentId: departmentId ?? undefined, sectionId: undefined })}
          placeholder="ทุกแผนก"
        />

        <SectionSelect
          departmentId={params.departmentId ?? null}
          value={params.sectionId ?? null}
          onChange={(sectionId) => update({ sectionId: sectionId ?? undefined })}
          placeholder="ทุกหน่วยงาน"
        />

        <Select
          placeholder="ทุก Role"
          value={params.role ?? null}
          onChange={(role) => update({ role: (role as 'USER' | 'ADMIN') || undefined })}
          data={ROLE_OPTIONS}
          clearable
        />

        <Select
          placeholder="ทุกสถานะ"
          value={params.status ?? null}
          onChange={(status) => update({ status: (status as 'active' | 'inactive') || undefined })}
          data={STATUS_OPTIONS}
          clearable
        />
      </Group>
    </Paper>
  );
}

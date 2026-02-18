import { Paper, SimpleGrid, Select } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { useTranslation } from '@/lib/i18n';
import { getStatusOptions } from '@/constants/options';
import type { DepartmentQueryParams, Status } from '../types';

// --- Filter Fields (shared between DepartmentFilters and DepartmentExportDrawer) ---

interface FilterValues {
  status?: Status;
}

interface DepartmentFilterFieldsProps {
  values: FilterValues;
  onUpdate: (patch: Partial<FilterValues>) => void;
}

export function DepartmentFilterFields({ values, onUpdate }: DepartmentFilterFieldsProps) {
  const { t } = useTranslation(['departments', 'common']);

  const STATUS_OPTIONS = getStatusOptions(t);

  return (
    <Select
      label={t('common:label.status')}
      placeholder={t('departments:filter.allStatuses')}
      value={values.status ?? null}
      onChange={(status) => onUpdate({ status: (status as Status) || undefined })}
      data={STATUS_OPTIONS}
      clearable
    />
  );
}

// --- Main Filter Panel ---

interface Props {
  params: DepartmentQueryParams;
  onChange: (params: DepartmentQueryParams) => void;
}

export function DepartmentFilters({ params, onChange }: Props) {
  const { t } = useTranslation(['departments']);
  const update = (patch: Partial<DepartmentQueryParams>) => onChange({ ...params, ...patch });

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <SearchInput
          label={t('departments:filter.searchLabel')}
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder={t('departments:filter.searchPlaceholder')}
        />

        <DepartmentFilterFields values={params} onUpdate={update} />
      </SimpleGrid>
    </Paper>
  );
}

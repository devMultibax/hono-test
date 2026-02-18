import { Paper, SimpleGrid, Select } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { useTranslation } from '@/lib/i18n';
import { getStatusOptions } from '@/constants/options';
import type { SectionQueryParams, Status } from '../types';

// --- Filter Fields (shared between SectionFilters and SectionExportDrawer) ---

interface FilterValues {
  departmentId?: number;
  status?: Status;
}

interface SectionFilterFieldsProps {
  values: FilterValues;
  onUpdate: (patch: Partial<FilterValues>) => void;
}

export function SectionFilterFields({ values, onUpdate }: SectionFilterFieldsProps) {
  const { t } = useTranslation(['sections', 'common']);

  const STATUS_OPTIONS = getStatusOptions(t);

  return (
    <>
      <DepartmentSelect
        label={t('sections:field.department')}
        placeholder={t('sections:filter.allDepartments')}
        value={values.departmentId ?? null}
        onChange={(departmentId) => onUpdate({ departmentId: departmentId ?? undefined })}
      />

      <Select
        label={t('common:label.status')}
        placeholder={t('sections:filter.allStatuses')}
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
  params: SectionQueryParams;
  onChange: (params: SectionQueryParams) => void;
}

export function SectionFilters({ params, onChange }: Props) {
  const { t } = useTranslation(['sections']);
  const update = (patch: Partial<SectionQueryParams>) => onChange({ ...params, ...patch });

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <DepartmentSelect
          label={t('sections:field.department')}
          placeholder={t('sections:filter.allDepartments')}
          value={params.departmentId ?? null}
          onChange={(departmentId) => update({ departmentId: departmentId ?? undefined })}
        />

        <SearchInput
          label={t('sections:filter.searchLabel')}
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder={t('sections:filter.searchPlaceholder')}
        />

        <Select
          label={t('common:label.status')}
          placeholder={t('sections:filter.allStatuses')}
          value={params.status ?? null}
          onChange={(status) => update({ status: (status as Status) || undefined })}
          data={getStatusOptions(t)}
          clearable
        />
      </SimpleGrid>
    </Paper>
  );
}

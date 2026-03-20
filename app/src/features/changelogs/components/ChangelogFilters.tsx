import { Paper, SimpleGrid, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { SearchInput } from '@/components/common/SearchInput';
import { useTranslation } from '@/lib/i18n';
import { getUpdateTypeOptions } from '../types';
import type { ChangelogQueryParams, UpdateType } from '../types';

interface Props {
  params: ChangelogQueryParams;
  onChange: (params: ChangelogQueryParams) => void;
}

export function ChangelogFilters({ params, onChange }: Props) {
  const { t } = useTranslation(['changelogs', 'common']);
  const update = (patch: Partial<ChangelogQueryParams>) => onChange({ ...params, ...patch });
  const updateTypeOptions = getUpdateTypeOptions(t);

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <SearchInput
          label={t('changelogs:filter.searchLabel')}
          value={params.search ?? ''}
          onChange={(search) => update({ search })}
          placeholder={t('changelogs:filter.searchPlaceholder')}
        />

        <Select
          label={t('changelogs:form.updateType.label')}
          placeholder={t('changelogs:filter.allTypes')}
          value={params.updateType ?? null}
          onChange={(value) => update({ updateType: (value as UpdateType) || undefined })}
          data={updateTypeOptions}
          clearable
        />

        <DatePickerInput
          label={t('changelogs:filter.startDate')}
          placeholder={t('changelogs:filter.startDate')}
          value={params.startDate ? new Date(params.startDate) : null}
          onChange={(date) => update({ startDate: date ? new Date(date).toISOString() : undefined })}
          valueFormat="DD/MM/YYYY"
          clearable
        />

        <DatePickerInput
          label={t('changelogs:filter.endDate')}
          placeholder={t('changelogs:filter.endDate')}
          value={params.endDate ? new Date(params.endDate) : null}
          onChange={(date) => update({ endDate: date ? new Date(date).toISOString() : undefined })}
          valueFormat="DD/MM/YYYY"
          clearable
        />
      </SimpleGrid>
    </Paper>
  );
}

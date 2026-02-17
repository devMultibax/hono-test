import { Paper, SimpleGrid, Title, Select, TextInput } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import type { SystemLogQueryParams } from '../types';

// --- Filter Fields (shared pattern like other modules) ---

interface FilterValues {
  startDateTime: string;
  endDateTime: string;
  level?: string;
}

interface SystemLogFilterFieldsProps {
  values: FilterValues;
  onUpdate: (patch: Partial<FilterValues>) => void;
}

export function SystemLogFilterFields({ values, onUpdate }: SystemLogFilterFieldsProps) {
  const { t } = useTranslation(['systemLogs', 'common']);

  const levelOptions = [
    { value: '', label: t('systemLogs:level.all') },
    { value: 'info', label: t('systemLogs:level.info') },
    { value: 'warn', label: t('systemLogs:level.warn') },
    { value: 'error', label: t('systemLogs:level.error') },
  ];

  return (
    <>
      <Select
        label={t('systemLogs:field.level')}
        placeholder="เลือก Level"
        data={levelOptions}
        value={values.level || ''}
        onChange={(level) => onUpdate({ level: level || '' })}
        clearable
      />

      <TextInput
        label={t('systemLogs:field.startDateTime')}
        type="datetime-local"
        value={values.startDateTime}
        onChange={(e) => onUpdate({ startDateTime: e.target.value })}
      />

      <TextInput
        label={t('systemLogs:field.endDateTime')}
        type="datetime-local"
        value={values.endDateTime}
        onChange={(e) => onUpdate({ endDateTime: e.target.value })}
      />
    </>
  );
}

// --- Main Filter Panel ---

interface Props {
  params: SystemLogQueryParams;
  onChange: (params: SystemLogQueryParams) => void;
}

export function SystemLogFilters({ params, onChange }: Props) {
  const { t } = useTranslation(['systemLogs']);
  const update = (patch: Partial<SystemLogQueryParams>) => onChange({ ...params, ...patch });

  return (
    <Paper p="md" mb={0} withBorder radius="md" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
      <Title order={5} size="h6" mb="md" c="dimmed">
        {t('systemLogs:filter.title')}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        <SystemLogFilterFields values={params} onUpdate={update} />
      </SimpleGrid>
    </Paper>
  );
}

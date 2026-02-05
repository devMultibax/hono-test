import { Select, type SelectProps } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Section } from '@/types';

interface Props extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  departmentId: number | null;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function SectionSelect({ departmentId, value, onChange, disabled, ...props }: Props) {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['master-data', 'sections', departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      const res = await apiClient.get<{ success: boolean; data: Section[] }>(
        `/master-data/departments/${departmentId}/sections`
      );
      return res.data.data ?? [];
    },
    enabled: !!departmentId,
  });

  const options = sections.map((s) => ({ value: String(s.id), label: s.name }));

  return (
    <Select
      {...props}
      data={options}
      value={value ? String(value) : null}
      onChange={(val) => onChange(val ? Number(val) : null)}
      disabled={!departmentId || isLoading || disabled}
      searchable
      clearable
    />
  );
}

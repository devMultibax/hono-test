import { Select, type SelectProps } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { Department } from '@/types';

interface Props extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function DepartmentSelect({ value, onChange, disabled, ...props }: Props) {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['master-data', 'departments'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Department[] }>('/master-data/departments');
      return res.data.data ?? [];
    },
  });

  const options = departments.map((d) => ({ value: String(d.id), label: d.name }));

  return (
    <Select
      {...props}
      data={options}
      value={value ? String(value) : null}
      onChange={(val) => onChange(val ? Number(val) : null)}
      disabled={isLoading || disabled}
      searchable
      clearable
    />
  );
}

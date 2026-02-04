import { Group, Text, Select, Pagination as MantinePagination } from '@mantine/core';
import type { Pagination } from '@/types';

interface Props {
  pagination: Pagination;
  onChange: (page: number, limit: number) => void;
}

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'];

export function TablePagination({ pagination, onChange }: Props) {
  const { page, limit, total, totalPages } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Group justify="space-between" mt="md">
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          แสดง {start} - {end} จาก {total} รายการ
        </Text>
        <Select
          size="xs"
          w={80}
          value={String(limit)}
          data={PAGE_SIZE_OPTIONS}
          onChange={(value) => value && onChange(1, Number(value))}
          allowDeselect={false}
        />
      </Group>

      <MantinePagination
        size="sm"
        total={totalPages}
        value={page}
        onChange={(newPage) => onChange(newPage, limit)}
        withEdges
      />
    </Group>
  );
}

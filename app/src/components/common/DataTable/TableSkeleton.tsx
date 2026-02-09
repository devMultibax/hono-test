import { useMemo } from 'react';
import { Table, Skeleton, Paper } from '@mantine/core';

interface Props {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: Props) {
  const widths = useMemo(
    () =>
      Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => `${60 + Math.random() * 30}%`)
      ),
    [columns, rows]
  );

  return (
    <Paper withBorder radius="md" shadow="sm">
      <Table>
        <Table.Thead bg="var(--mantine-color-gray-0)">
          <Table.Tr>
            {Array.from({ length: columns }).map((_, i) => (
              <Table.Th key={i} style={{ padding: '12px 16px' }}>
                <Skeleton height={20} width="80%" animate />
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {widths.map((rowWidths, rowIndex) => (
            <Table.Tr key={rowIndex}>
              {rowWidths.map((width, colIndex) => (
                <Table.Td key={colIndex} style={{ padding: '10px 16px' }}>
                  <Skeleton height={16} width={width} animate />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

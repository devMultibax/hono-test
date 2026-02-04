import { Table, Skeleton } from '@mantine/core';

interface Props {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: Props) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {Array.from({ length: columns }).map((_, i) => (
            <Table.Th key={i}>
              <Skeleton height={20} width="80%" />
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Table.Tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Table.Td key={colIndex}>
                <Skeleton height={16} width={`${60 + Math.random() * 30}%`} />
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

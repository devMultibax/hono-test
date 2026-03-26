import { Title } from '@mantine/core';

interface Props {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Title order={2}>{title}</Title>
      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

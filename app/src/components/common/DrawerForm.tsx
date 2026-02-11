import type { ReactNode } from 'react';
import { Drawer, LoadingOverlay, Alert } from '@mantine/core';
import { AlertCircle } from 'lucide-react';

interface DrawerFormProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
  error?: Error | null;
  errorMessage?: string;
  children: ReactNode;
  size?: string;
}

export function DrawerForm({
  opened,
  onClose,
  title,
  isLoading,
  error,
  errorMessage,
  children,
  size = 'lg',
}: DrawerFormProps) {
  return (
    <Drawer opened={opened} onClose={onClose} title={title} position="right" size={size}>
      <LoadingOverlay visible={!!isLoading} />

      {error ? (
        <Alert icon={<AlertCircle size={16} />} color="red">
          {errorMessage ?? error.message}
        </Alert>
      ) : (
        !isLoading && children
      )}
    </Drawer>
  );
}

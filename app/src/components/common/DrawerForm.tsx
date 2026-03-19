import type { ReactNode } from 'react';
import { Drawer, LoadingOverlay, Alert, Box } from '@mantine/core';
import { AlertCircle } from 'lucide-react';

interface DrawerFormProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
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
  isSubmitting,
  error,
  errorMessage,
  children,
  size = 'lg',
}: DrawerFormProps) {
  const locked = !!isLoading || !!isSubmitting;
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      position="right"
      size={size}
      closeOnClickOutside={!locked}
      closeOnEscape={!locked}
      withCloseButton={!locked}
    >
      <Box pos="relative" style={{ minHeight: 100 }}>
        <LoadingOverlay visible={!!isLoading} zIndex={10} overlayProps={{ radius: 'sm', blur: 2 }} />

        {!isLoading && (
          error ? (
            <Alert icon={<AlertCircle size={16} />} color="red">
              {errorMessage ?? error.message}
            </Alert>
          ) : (
            children
          )
        )}
      </Box>
    </Drawer>
  );
}

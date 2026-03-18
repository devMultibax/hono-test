import type { ReactNode } from 'react';
import { Box, LoadingOverlay } from '@mantine/core';

interface FormOverlayProps {
  loading: boolean;
  children: ReactNode;
}

export function FormOverlay({ loading, children }: FormOverlayProps) {
  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={10} overlayProps={{ radius: 'sm', blur: 2 }} />
      {children}
    </Box>
  );
}

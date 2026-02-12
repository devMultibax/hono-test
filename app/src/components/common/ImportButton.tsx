import { useState, useRef, useCallback } from 'react';
import { Button, Drawer, Text, Stack, Alert, Group, UnstyledButton, RingProgress, ThemeIcon, ScrollArea, Divider } from '@mantine/core';
import { IconCheck, IconX, IconAlertTriangle, IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';
import { apiClient } from '@/api/client';
import { Report } from '@/utils/mantineAlertUtils';
import { useConfirm } from '@/hooks/useConfirm';
import { useTranslation } from '@/lib/i18n';
import type { AxiosError } from 'axios';

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors?: string[];
}

interface Props {
  endpoint: string;
  onSuccess?: () => void;
  onDownloadTemplate?: () => void;
  accept?: string;
  maxSize?: number; // MB
}

export function ImportButton({
  endpoint,
  onSuccess,
  onDownloadTemplate,
  accept = '.xlsx,.xls',
  maxSize = 5,
}: Props) {
  const { t } = useTranslation(['users', 'common']);
  const { confirm } = useConfirm();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setResult(null);
    setDragOver(false);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const handleClose = useCallback(() => {
    setOpened(false);
    resetState();
  }, [resetState]);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setResult({
        success: 0,
        failed: 1,
        total: 1,
        errors: [t('users:import.fileSizeError', { size: maxSize })],
      });
      return;
    }
    setSelectedFile(file);
    setResult(null);
  }, [maxSize, t]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await apiClient.post<ImportResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
      setSelectedFile(null);

      if (response.data.success > 0) {
        Report.success(t('users:import.successMessage', { count: response.data.success }));
      }

      // Always refresh the list after import (even if some rows failed)
      onSuccess?.();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setResult({
        success: 0,
        failed: 1,
        total: 1,
        errors: [axiosError.response?.data?.message || t('users:import.importError')],
      });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [selectedFile, endpoint, onSuccess, t]);

  const successRate = result ? Math.round((result.success / result.total) * 100) : 0;

  return (
    <>
      <Button variant="light" size="xs" onClick={() => setOpened(true)}>
        {t('users:import.button')}
      </Button>

      <Drawer
        opened={opened}
        onClose={handleClose}
        title={result ? t('users:import.resultTitle') : t('users:import.modalTitle')}
        position="right"
        size="md"
      >
        {result ? (
          <Stack gap="md">
            {/* Summary header */}
            <Group justify="center" gap="xl">
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[
                  { value: successRate, color: 'teal' },
                  { value: 100 - successRate, color: result.failed > 0 ? 'red.3' : 'gray.2' },
                ]}
                label={
                  <ThemeIcon
                    color={successRate === 100 ? 'teal' : successRate > 0 ? 'yellow' : 'red'}
                    variant="light"
                    radius="xl"
                    size="xl"
                  >
                    {successRate === 100
                      ? <IconCheck size={20} />
                      : successRate > 0
                        ? <IconAlertTriangle size={20} />
                        : <IconX size={20} />
                    }
                  </ThemeIcon>
                }
              />
              <Stack gap={4}>
                <Group gap="xs">
                  <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                  <Text size="sm">{t('users:import.success', { count: result.success })}</Text>
                </Group>
                {result.failed > 0 && (
                  <Group gap="xs">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <Text size="sm">{t('users:import.failed', { count: result.failed })}</Text>
                  </Group>
                )}
              </Stack>
            </Group>

            {/* Error details */}
            {result.errors && result.errors.length > 0 && (
              <>
                <Divider />
                <Text fw={500} size="sm">{t('users:import.errorDetails')}</Text>
                <ScrollArea.Autosize mah={160}>
                  <Stack gap={4}>
                    {result.errors.map((err, i) => (
                      <Alert key={i} color="red" variant="light" py={6} px="sm">
                        <Text size="xs">{err}</Text>
                      </Alert>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              </>
            )}

            <Group justify="flex-end">
              <Button variant='subtle' color='gray' size="sm" onClick={handleClose}>{t('common:button.close')}</Button>
              <Button size="sm" onClick={resetState}>
                {t('users:import.importAgain')}
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack>
            {/* Download template section */}
            {onDownloadTemplate && (
              <Group gap="xs" justify="center" py={4}>
                <Text size="xs" c="dimmed">{t('users:import.templateHint')}</Text>
                <Text
                  size="xs"
                  c="blue"
                  td="underline"
                  style={{ cursor: 'pointer' }}
                  onClick={onDownloadTemplate}
                >
                  {t('users:import.downloadTemplate')}
                </Text>
              </Group>
            )}

            {/* Drop zone */}
            <UnstyledButton
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className="w-full"
            >
              <div
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {selectedFile
                  ? <IconFileSpreadsheet size={28} className="text-green-500" />
                  : <IconUpload size={28} className="text-gray-400" />
                }
                {selectedFile ? (
                  <>
                    <Text size="sm" fw={500}>{selectedFile.name}</Text>
                    <Text size="xs" c="dimmed">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Text>
                  </>
                ) : (
                  <>
                    <Text size="sm" fw={500} c="dimmed">
                      {t('users:import.dropzoneTitle')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('users:import.dropzoneHint', { size: maxSize })}
                    </Text>
                  </>
                )}
              </div>
            </UnstyledButton>

            <input
              ref={fileRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Actions */}
            <Group justify="flex-end">
              <Button variant="subtle" color='gray' onClick={handleClose}>
                {t('common:button.cancel')}
              </Button>
              <Button
                onClick={() => confirm({
                  message: t('users:import.confirmMessage'),
                  onConfirm: handleImport,
                })}
                loading={loading}
                disabled={!selectedFile}
              >
                {t('users:import.uploadFile')}
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>
    </>
  );
}

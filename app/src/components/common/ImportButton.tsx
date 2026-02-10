import { useState, useRef, useCallback } from 'react';
import { Button, Modal, Text, List, Progress, Stack, Alert, Group, UnstyledButton } from '@mantine/core';
import { apiClient } from '@/api/client';
import { Report } from '@/utils/notiflix';
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

      <Modal
        opened={opened}
        onClose={handleClose}
        title={result ? t('users:import.resultTitle') : t('users:import.modalTitle')}
        size="md"
      >
        {result ? (
          <Stack>
            <Progress
              value={successRate}
              color={successRate === 100 ? 'green' : successRate > 0 ? 'yellow' : 'red'}
              size="lg"
            />

            <div className="flex gap-4">
              <Alert color="green" className="flex-1">
                <Text fw={500}>{t('users:import.success', { count: result.success })}</Text>
              </Alert>
              {result.failed > 0 && (
                <Alert color="red" className="flex-1">
                  <Text fw={500}>{t('users:import.failed', { count: result.failed })}</Text>
                </Alert>
              )}
            </div>

            {result.errors && result.errors.length > 0 && (
              <>
                <Text fw={500} size="sm">{t('users:import.errorDetails')}</Text>
                <List size="sm" className="max-h-48 overflow-auto">
                  {result.errors.map((err, i) => (
                    <List.Item key={i} c="red">{err}</List.Item>
                  ))}
                </List>
              </>
            )}

            <Group justify="flex-end">
              <Button variant="default" onClick={resetState}>
                {t('users:import.importAgain')}
              </Button>
              <Button onClick={handleClose}>{t('common:button.close')}</Button>
            </Group>
          </Stack>
        ) : (
          <Stack>
            {/* Download template section */}
            {onDownloadTemplate && (
              <Alert variant="light" color="blue">
                <Group justify="space-between" align="center">
                  <Text size="sm">{t('users:import.templateHint')}</Text>
                  <Button
                    variant="light"
                    size="xs"
                    onClick={onDownloadTemplate}
                  >
                    {t('users:import.downloadTemplate')}
                  </Button>
                </Group>
              </Alert>
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
                <Text size="lg" c="dimmed">
                  {selectedFile ? '📄' : '📁'}
                </Text>
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
              <Button variant="default" onClick={handleClose}>
                {t('common:button.cancel')}
              </Button>
              <Button
                onClick={handleImport}
                loading={loading}
                disabled={!selectedFile}
              >
                {t('users:import.uploadFile')}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}

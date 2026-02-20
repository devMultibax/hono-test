import { useState, useRef, useCallback } from 'react';
import { Button, Drawer, Text, Stack, Alert, Group, UnstyledButton, RingProgress, ThemeIcon, ScrollArea, Divider } from '@mantine/core';
import { IconCheck, IconX, IconAlertTriangle, IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';
import { apiClient } from '@/api/client';
import { Report } from '@/utils/mantineAlertUtils';
import { useConfirm } from '@/hooks/useConfirm';
import { useTranslation } from '@/lib/i18n';
import i18n from '@/lib/i18n/config';

export interface ImportRowError {
  row: number;
  code: string;
  params?: Record<string, unknown>;
}

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors?: ImportRowError[];
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
  const fileRef = useRef<HTMLInputElement>(null);

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
        success: 0, failed: 1, total: 1,
        errors: [{ row: 0, code: 'IMPORT_FILE_TOO_LARGE', params: { size: maxSize } }],
      });
      return;
    }
    setSelectedFile(file);
    setResult(null);
  }, [maxSize]);

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

      onSuccess?.();
    } catch (error) {
      const { extractErrorMessage } = await import('@/utils/errorHandlerUtils');
      const message = extractErrorMessage(error) || t('users:import.importError');
      setResult({
        success: 0, failed: 1, total: 1,
        errors: [{ row: 0, code: '__message__', params: { message } }],
      });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [selectedFile, endpoint, onSuccess, t]);

  const handleConfirmImport = useCallback(async () => {
    const confirmed = await confirm({
      title: t('users:import.confirmTitle'),
      message: t('users:import.confirmMessage'),
    });
    if (!confirmed) return;
    await handleImport();
  }, [confirm, handleImport, t]);

  return (
    <>
      <Button variant="subtle" size="xs" onClick={() => setOpened(true)}>
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
          <ResultView result={result} onClose={handleClose} onRetry={resetState} />
        ) : (
          <UploadView
            file={selectedFile}
            dragOver={dragOver}
            loading={loading}
            fileRef={fileRef}
            accept={accept}
            maxSize={maxSize}
            onDownloadTemplate={onDownloadTemplate}
            onFileSelect={handleFileSelect}
            onDragOverChange={setDragOver}
            onClose={handleClose}
            onImport={handleConfirmImport}
          />
        )}
      </Drawer>
    </>
  );
}

// --- Result View ---

interface ResultViewProps {
  result: ImportResult;
  onClose: () => void;
  onRetry: () => void;
}

function ResultView({ result, onClose, onRetry }: ResultViewProps) {
  const { t } = useTranslation(['users', 'common']);
  const successRate = Math.round((result.success / result.total) * 100);
  const hasErrors = result.errors && result.errors.length > 0;

  function formatRowError(err: ImportRowError): string {
    // Special synthetic error from catch block carrying an already-translated message
    if (err.code === '__message__') return String(err.params?.message ?? '');
    // File-too-large error is handled client-side with existing i18n key
    if (err.code === 'IMPORT_FILE_TOO_LARGE') return t('users:import.fileSizeError', { size: err.params?.size });
    const apiKey = `api:${err.code}`;
    const translated = i18n.exists(apiKey) ? i18n.t(apiKey, err.params ?? {}) : err.code;
    return err.row > 0 ? `แถวที่ ${err.row}: ${translated}` : translated;
  }

  return (
    <Stack gap="md">
      <Group justify="center" gap="xl">
        <ResultRing successRate={successRate} hasFailed={result.failed > 0} />
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

      {hasErrors && (
        <>
          <Divider />
          <Text fw={500} size="sm">{t('users:import.errorDetails')}</Text>
          <ScrollArea.Autosize mah={160}>
            <Stack gap={4}>
              {result.errors?.map((err, i) => (
                <Alert key={i} color="red" variant="light" py={6} px="sm">
                  <Text size="xs">{formatRowError(err)}</Text>
                </Alert>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        </>
      )}

      <Group justify="flex-end">
        <Button variant="subtle" color="gray" size="sm" onClick={onClose}>
          {t('common:button.close')}
        </Button>
        <Button size="sm" onClick={onRetry}>
          {t('users:import.importAgain')}
        </Button>
      </Group>
    </Stack>
  );
}

interface ResultRingProps {
  successRate: number;
  hasFailed: boolean;
}

function getResultIndicator(rate: number) {
  if (rate === 100) return { color: 'teal', Icon: IconCheck } as const;
  if (rate > 0) return { color: 'yellow', Icon: IconAlertTriangle } as const;
  return { color: 'red', Icon: IconX } as const;
}

function ResultRing({ successRate, hasFailed }: ResultRingProps) {
  const { color, Icon } = getResultIndicator(successRate);

  return (
    <RingProgress
      size={80}
      thickness={8}
      roundCaps
      sections={[
        { value: successRate, color: 'teal' },
        { value: 100 - successRate, color: hasFailed ? 'red.3' : 'gray.2' },
      ]}
      label={
        <ThemeIcon color={color} variant="light" radius="xl" size="xl">
          <Icon size={20} />
        </ThemeIcon>
      }
    />
  );
}

// --- Upload View ---

interface UploadViewProps {
  file: File | null;
  dragOver: boolean;
  loading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  maxSize: number;
  onDownloadTemplate?: () => void;
  onFileSelect: (file: File) => void;
  onDragOverChange: (over: boolean) => void;
  onClose: () => void;
  onImport: () => void;
}

function getDropZoneClass(isDragOver: boolean, hasFile: boolean) {
  if (isDragOver) return 'border-blue-400 bg-blue-50';
  if (hasFile) return 'border-green-400 bg-green-50';
  return 'border-gray-300 hover:border-gray-400 hover:bg-gray-50';
}

function UploadView({
  file, dragOver, loading, fileRef, accept, maxSize,
  onDownloadTemplate, onFileSelect, onDragOverChange, onClose, onImport,
}: UploadViewProps) {
  const { t } = useTranslation(['users', 'common']);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOverChange(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  const dropZoneClass = getDropZoneClass(dragOver, !!file);

  return (
    <Stack>
      {onDownloadTemplate && (
        <Group gap="xs" justify="center" py={4}>
          <Text size="xs" c="dimmed">{t('users:import.templateHint')}</Text>
          <Text size="xs" c="blue" td="underline" style={{ cursor: 'pointer' }} onClick={onDownloadTemplate}>
            {t('users:import.downloadTemplate')}
          </Text>
        </Group>
      )}

      <UnstyledButton
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); onDragOverChange(true); }}
        onDragLeave={() => onDragOverChange(false)}
        onDrop={handleDrop}
        className="w-full"
      >
        <div className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors ${dropZoneClass}`}>
          {file
            ? <IconFileSpreadsheet size={28} className="text-green-500" />
            : <IconUpload size={28} className="text-gray-400" />
          }
          {file ? (
            <>
              <Text size="sm" fw={500}>{file.name}</Text>
              <Text size="xs" c="dimmed">{(file.size / 1024).toFixed(1)} KB</Text>
            </>
          ) : (
            <>
              <Text size="sm" fw={500} c="dimmed">{t('users:import.dropzoneTitle')}</Text>
              <Text size="xs" c="dimmed">{t('users:import.dropzoneHint', { size: maxSize })}</Text>
            </>
          )}
        </div>
      </UnstyledButton>

      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFileChange} />

      <Group justify="flex-end">
        <Button variant="subtle" color="gray" onClick={onClose}>
          {t('common:button.cancel')}
        </Button>
        <Button onClick={onImport} loading={loading} disabled={!file}>
          {t('users:import.uploadFile')}
        </Button>
      </Group>
    </Stack>
  );
}

import { useState, useRef } from 'react';
import { Button, Modal, Text, List, Progress, Stack, Alert } from '@mantine/core';
import { Upload, Check, X } from 'lucide-react';
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
  accept?: string;
  maxSize?: number; // MB
}

export function ImportButton({
  endpoint,
  onSuccess,
  accept = '.xlsx,.xls',
  maxSize = 5
}: Props) {
  const { t } = useTranslation(['users', 'common']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setResult({
        success: 0,
        failed: 1,
        total: 1,
        errors: [t('users:import.fileSizeError', { size: maxSize })],
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<ImportResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);

      if (response.data.success > 0) {
        Report.success(t('users:import.successMessage', { count: response.data.success }));
        onSuccess?.();
      }
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
  };

  const successRate = result ? Math.round((result.success / result.total) * 100) : 0;

  return (
    <>
      <Button
        variant="default"
        leftSection={<Upload size={16} />}
        onClick={() => fileRef.current?.click()}
        loading={loading}
      >
        {t('users:import.button')}
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      <Modal
        opened={!!result}
        onClose={() => setResult(null)}
        title={t('users:import.resultTitle')}
      >
        {result && (
          <Stack>
            <Progress
              value={successRate}
              color={successRate === 100 ? 'green' : successRate > 0 ? 'yellow' : 'red'}
              size="lg"
            />

            <div className="flex gap-4">
              <Alert icon={<Check size={16} />} color="green" className="flex-1">
                <Text fw={500}>{t('users:import.success', { count: result.success })}</Text>
              </Alert>
              {result.failed > 0 && (
                <Alert icon={<X size={16} />} color="red" className="flex-1">
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

            <Button onClick={() => setResult(null)}>{t('common:button.close')}</Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}

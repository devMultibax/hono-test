import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Drawer, Button, Stack, Group, Text } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Loading, Report } from '@/utils/mantineAlertUtils';

interface ExportDrawerProps<TParams> {
  opened: boolean;
  onClose: () => void;
  title: string;
  initialParams: TParams;
  onExport: (params: TParams, signal: AbortSignal) => Promise<void>;
  children: (params: TParams, update: (patch: Partial<TParams>) => void) => ReactNode;
  hint?: string;
  confirmTitle?: string;
  confirmMessage?: string;
}

export function ExportDrawer<TParams>({
  opened,
  onClose,
  title,
  initialParams,
  onExport,
  children,
  hint,
  confirmTitle,
  confirmMessage,
}: ExportDrawerProps<TParams>) {
  const { t } = useTranslation('common');
  const { confirm } = useConfirm();
  const [params, setParams] = useState<TParams>(initialParams);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (opened) {
      setParams(initialParams);
    }
  }, [opened, initialParams]);

  const update = useCallback(
    (patch: Partial<TParams>) => setParams((prev) => ({ ...prev, ...patch })),
    [],
  );

  const handleExport = useCallback(async () => {
    if (confirmTitle && confirmMessage) {
      const confirmed = await confirm({ title: confirmTitle, message: confirmMessage });
      if (!confirmed) return;
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const handleCancel = () => {
      abortControllerRef.current?.abort();
    };

    onClose();
    Loading.show(t('common:export.generatingFile'), handleCancel);

    try {
      await onExport(params, signal);
    } catch (err) {
      const error = err as Error;
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return;
      }
      Report.error(t('common:export.downloadFailed'));
    } finally {
      Loading.hide();
    }
  }, [params, onExport, onClose, confirm, confirmTitle, confirmMessage, t]);

  return (
    <Drawer opened={opened} onClose={onClose} title={title} position="right" size="xs">
      <Stack gap="md">
        {hint && <Text size="sm" c="dimmed" mb="md">{hint}</Text>}

        <Stack gap="md">
          {children(params, update)}
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={onClose}>
            {t('common:button.cancel')}
          </Button>
          <Button onClick={handleExport}>
            {t('common:button.download')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

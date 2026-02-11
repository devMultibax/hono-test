import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Drawer, Button, Stack, Group, Text } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';

interface ExportDrawerProps<TParams> {
  opened: boolean;
  onClose: () => void;
  title: string;
  initialParams: TParams;
  onExport: (params: TParams) => Promise<void>;
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
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<TParams>(initialParams);

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
    const doExport = async () => {
      setLoading(true);
      try {
        await onExport(params);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (confirmTitle && confirmMessage) {
      confirm({
        title: confirmTitle,
        message: confirmMessage,
        onConfirm: doExport,
      });
    } else {
      await doExport();
    }
  }, [params, onExport, onClose, confirm, confirmTitle, confirmMessage]);

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
          <Button onClick={handleExport} loading={loading}>
            {t('common:button.download')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

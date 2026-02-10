import { useState } from 'react';
import { Button, Loader } from '@mantine/core';
import { useTranslation } from '@/lib/i18n';

interface Props {
  onExport: () => Promise<void>;
  disabled?: boolean;
}

export function ExportButton({ onExport, disabled }: Props) {
  const { t } = useTranslation(['common']);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="light"
      color='teal'
      size='xs'
      leftSection={loading ? <Loader size={14} /> : undefined}
      disabled={disabled || loading}
      onClick={handleExport}
    >
      {t('common:button.downloadReport')}
    </Button>
  );
}

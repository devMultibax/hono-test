import { useState } from 'react';
import { Button, Loader } from '@mantine/core';
import { Download } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Props {
  onExport: () => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ onExport, disabled }: Props) {
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
      variant="default"
      leftSection={loading ? <Loader size={14} /> : <Download size={16} />}
      disabled={disabled || loading}
      onClick={handleExport}
    >
      {t('common:button.export')}
    </Button>
  );
}

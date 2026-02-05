import { useState } from 'react';
import { Menu, Button, Loader } from '@mantine/core';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Props {
  onExportExcel: () => Promise<void>;
  onExportPdf: () => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ onExportExcel, onExportPdf, disabled }: Props) {
  const { t } = useTranslation(['common']);
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);

  const handleExport = async (type: 'excel' | 'pdf') => {
    setLoading(type);
    try {
      if (type === 'excel') {
        await onExportExcel();
      } else {
        await onExportPdf();
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Menu position="bottom-end" disabled={disabled}>
      <Menu.Target>
        <Button
          variant="default"
          leftSection={loading ? <Loader size={14} /> : <Download size={16} />}
          disabled={disabled || !!loading}
        >
          {t('common:button.export')}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<FileSpreadsheet size={14} />}
          onClick={() => handleExport('excel')}
          disabled={loading === 'excel'}
        >
          Excel (.xlsx)
        </Menu.Item>
        <Menu.Item
          leftSection={<FileText size={14} />}
          onClick={() => handleExport('pdf')}
          disabled={loading === 'pdf'}
        >
          PDF
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

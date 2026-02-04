import { useState } from 'react';
import { Menu, Button, Loader } from '@mantine/core';
import { IconDownload, IconFileTypeCsv, IconFileTypePdf } from '@tabler/icons-react';

interface Props {
  onExportExcel: () => Promise<void>;
  onExportPdf: () => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ onExportExcel, onExportPdf, disabled }: Props) {
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
          leftSection={loading ? <Loader size={14} /> : <IconDownload size={16} />}
          disabled={disabled || !!loading}
        >
          Export
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconFileTypeCsv size={14} />}
          onClick={() => handleExport('excel')}
          disabled={loading === 'excel'}
        >
          Excel (.xlsx)
        </Menu.Item>
        <Menu.Item
          leftSection={<IconFileTypePdf size={14} />}
          onClick={() => handleExport('pdf')}
          disabled={loading === 'pdf'}
        >
          PDF
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

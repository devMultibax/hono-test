import { ExportDrawer } from '@/components/common/ExportDrawer';
import { SectionFilterFields } from './SectionFilters';
import { useTranslation } from '@/lib/i18n';
import type { SectionQueryParams, SectionExportParams } from '../types';

interface Props {
  opened: boolean;
  onClose: () => void;
  initialParams: SectionQueryParams;
  onExport: (params: SectionExportParams) => Promise<void>;
}

export function SectionExportDrawer({ opened, onClose, initialParams, onExport }: Props) {
  const { t } = useTranslation(['sections']);

  const exportInitialParams: SectionExportParams = {
    departmentId: initialParams.departmentId,
    status: initialParams.status,
  };

  return (
    <ExportDrawer<SectionExportParams>
      opened={opened}
      onClose={onClose}
      title={t('sections:export.modalTitle')}
      initialParams={exportInitialParams}
      onExport={onExport}
      confirmTitle={t('sections:confirm.export.title')}
      confirmMessage={t('sections:confirm.export.message')}
    >
      {(params, update) => (
        <SectionFilterFields values={params} onUpdate={update} />
      )}
    </ExportDrawer>
  );
}

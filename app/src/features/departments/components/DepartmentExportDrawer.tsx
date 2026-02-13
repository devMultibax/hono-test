import { ExportDrawer } from '@/components/common/ExportDrawer';
import { DepartmentFilterFields } from './DepartmentFilters';
import { useTranslation } from '@/lib/i18n';
import type { DepartmentQueryParams, DepartmentExportParams } from '../types';

interface Props {
  opened: boolean;
  onClose: () => void;
  initialParams: DepartmentQueryParams;
  onExport: (params: DepartmentExportParams) => Promise<void>;
}

export function DepartmentExportDrawer({ opened, onClose, initialParams, onExport }: Props) {
  const { t } = useTranslation(['departments']);

  const exportInitialParams: DepartmentExportParams = {
    status: initialParams.status,
  };

  return (
    <ExportDrawer<DepartmentExportParams>
      opened={opened}
      onClose={onClose}
      title={t('departments:export.modalTitle')}
      initialParams={exportInitialParams}
      onExport={onExport}
      confirmTitle={t('departments:confirm.export.title')}
      confirmMessage={t('departments:confirm.export.message')}
    >
      {(params, update) => (
        <DepartmentFilterFields values={params} onUpdate={update} />
      )}
    </ExportDrawer>
  );
}

import { useMemo } from 'react';
import { ExportDrawer } from '@/components/common/ExportDrawer';
import { UserFilterFields } from './UserFilters';
import { useTranslation } from '@/lib/i18n';
import { useUser } from '@/stores/auth.store';
import type { UserQueryParams, UserExportParams } from '../types';

interface Props {
  opened: boolean;
  onClose: () => void;
  initialParams: UserQueryParams;
  onExport: (params: UserExportParams, signal: AbortSignal) => Promise<void>;
}

export function UserExportDrawer({ opened, onClose, initialParams, onExport }: Props) {
  const { t } = useTranslation(['users']);
  const currentUser = useUser();

  const userDepartmentIds = useMemo(
    () => currentUser?.departments?.map((d) => d.departmentId) ?? [],
    [currentUser?.departments]
  );

  const exportInitialParams: UserExportParams = {
    departmentId: initialParams.departmentId,
    sectionId: initialParams.sectionId,
    role: initialParams.role,
    status: initialParams.status,
  };

  return (
    <ExportDrawer<UserExportParams>
      opened={opened}
      onClose={onClose}
      title={t('users:export.modalTitle')}
      initialParams={exportInitialParams}
      onExport={onExport}
      confirmTitle={t('users:confirm.export.title')}
      confirmMessage={t('users:confirm.export.message')}
    >
      {(params, update) => (
        <UserFilterFields values={params} onUpdate={update} userDepartmentIds={userDepartmentIds} />
      )}
    </ExportDrawer>
  );
}

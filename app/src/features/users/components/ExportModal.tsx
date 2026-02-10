import { useState, useEffect, useCallback } from 'react';
import { Drawer, Button, Select, Stack, Group, Text } from '@mantine/core';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import { useTranslation } from '@/lib/i18n';
import { getRoleOptions, getStatusOptions } from '@/constants/options';
import type { UserQueryParams } from '@/types';

interface ExportParams {
  departmentId?: number;
  sectionId?: number;
  role?: 'USER' | 'ADMIN';
  status?: 'active' | 'inactive';
}

interface Props {
  opened: boolean;
  onClose: () => void;
  initialParams: UserQueryParams;
  onExport: (params: ExportParams) => Promise<void>;
}

export function ExportModal({ opened, onClose, initialParams, onExport }: Props) {
  const { t } = useTranslation(['users', 'common']);
  const [loading, setLoading] = useState(false);
  const [exportParams, setExportParams] = useState<ExportParams>({});

  useEffect(() => {
    if (opened) {
      setExportParams({
        departmentId: initialParams.departmentId,
        sectionId: initialParams.sectionId,
        role: initialParams.role,
        status: initialParams.status,
      });
    }
  }, [opened, initialParams]);

  const update = (patch: Partial<ExportParams>) =>
    setExportParams((prev) => ({ ...prev, ...patch }));

  const handleExport = useCallback(async () => {
    setLoading(true);
    try {
      await onExport(exportParams);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [exportParams, onExport, onClose]);

  const ROLE_OPTIONS = getRoleOptions(t);
  const STATUS_OPTIONS = getStatusOptions(t);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('users:export.modalTitle')}
      position="right"
      size="md"
    >
      <Stack>
        <Text size="sm" c="dimmed">{t('users:export.filterHint')}</Text>

        <DepartmentSelect
          value={exportParams.departmentId ?? null}
          onChange={(departmentId) => update({ departmentId: departmentId ?? undefined, sectionId: undefined })}
          placeholder={t('users:filter.allDepartments')}
        />

        <SectionSelect
          departmentId={exportParams.departmentId ?? null}
          value={exportParams.sectionId ?? null}
          onChange={(sectionId) => update({ sectionId: sectionId ?? undefined })}
          placeholder={t('users:filter.allSections')}
        />

        <Select
          placeholder={t('users:filter.allRoles')}
          value={exportParams.role ?? null}
          onChange={(role) => update({ role: (role as 'USER' | 'ADMIN') || undefined })}
          data={ROLE_OPTIONS}
          clearable
        />

        <Select
          placeholder={t('users:filter.allStatuses')}
          value={exportParams.status ?? null}
          onChange={(status) => update({ status: (status as 'active' | 'inactive') || undefined })}
          data={STATUS_OPTIONS}
          clearable
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" color='gray' onClick={onClose}>
            {t('common:button.cancel')}
          </Button>
          <Button
            onClick={handleExport}
            loading={loading}
          >
            {t('users:export.download')}
          </Button>
        </Group>
      </Stack>
    </Drawer>
  );
}

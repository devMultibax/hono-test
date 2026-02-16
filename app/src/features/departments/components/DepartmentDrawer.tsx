import { Drawer, Button, Stack, Grid, Group } from '@mantine/core';
import { DrawerForm } from '@/components/common/DrawerForm';
import { StatusBadge } from '@/components/common/StatusBadge';
import { InfoField } from '@/components/common/InfoField';
import { DepartmentForm } from './DepartmentForm';
import { useDepartment, useCreateDepartment, useUpdateDepartment } from '../hooks/useDepartments';
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { formatDateTime } from '@/lib/date';
import type { DepartmentDrawerState, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types';

interface Props {
  state: DepartmentDrawerState;
  onClose: () => void;
  onEdit: (departmentId: number) => void;
}

export function DepartmentDrawer({ state, onClose, onEdit }: Props) {
  const departmentId = 'departmentId' in state ? state.departmentId : 0;

  if (state.mode === 'create') {
    return <CreateContent opened onClose={onClose} />;
  }

  if (state.mode === 'edit') {
    return <EditContent opened departmentId={departmentId} onClose={onClose} />;
  }

  if (state.mode === 'detail') {
    return <DetailContent opened departmentId={departmentId} onClose={onClose} onEdit={onEdit} />;
  }

  return null;
}

// --- Create ---

function CreateContent({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation(['departments', 'common']);
  const { confirm } = useConfirm();
  const createDepartment = useCreateDepartment();

  const handleSubmit = async (data: CreateDepartmentRequest) => {
    const confirmed = await confirm({
      title: t('departments:confirm.create.title'),
      message: t('departments:confirm.create.message', { name: data.name }),
    });
    if (!confirmed) return;

    await createDepartment.mutateAsync(data);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('departments:page.createTitle')}
      position="right"
      size="lg"
    >
      <DepartmentForm onSubmit={handleSubmit} onCancel={onClose} isLoading={createDepartment.isPending} />
    </Drawer>
  );
}

// --- Edit ---

function EditContent({ opened, departmentId, onClose }: { opened: boolean; departmentId: number; onClose: () => void }) {
  const { t } = useTranslation(['departments']);
  const { confirm } = useConfirm();
  const { data: department, isLoading, error } = useDepartment(departmentId);
  const updateDepartment = useUpdateDepartment();

  const handleSubmit = async (data: UpdateDepartmentRequest) => {
    const confirmed = await confirm({
      title: t('departments:confirm.update.title'),
      message: t('departments:confirm.update.message', { name: department?.name }),
    });
    if (!confirmed) return;

    await updateDepartment.mutateAsync({ id: departmentId, data });
    onClose();
  };

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('departments:page.editTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('departments:message.departmentNotFound')}
    >
      {department && (
        <DepartmentForm initialData={department} onSubmit={handleSubmit} onCancel={onClose} isLoading={updateDepartment.isPending} />
      )}
    </DrawerForm>
  );
}

// --- Detail ---

function DetailContent({ opened, departmentId, onClose, onEdit }: { opened: boolean; departmentId: number; onClose: () => void; onEdit: (departmentId: number) => void }) {
  const { t } = useTranslation(['departments', 'common']);
  const userRole = useUserRole();
  const canEdit = hasRole([ROLE_ID.ADMIN], userRole);
  const { data: department, isLoading, error } = useDepartment(departmentId);

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('departments:page.detailTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('departments:message.departmentNotFound')}
    >
      {department && (
        <Stack gap="md">
          <Grid>
            <InfoField label={t('departments:field.name')}>{department.name}</InfoField>
            <InfoField label={t('departments:field.status')}><StatusBadge status={department.status} /></InfoField>
          </Grid>

          <Grid>
            <InfoField label={t('common:field.createdAt')}>{formatDateTime(department.createdAt)}</InfoField>
            <InfoField label={t('common:field.createdBy')}>{department.createdByName || department.createdBy}</InfoField>
            {department.updatedAt && (
              <>
                <InfoField label={t('common:field.updatedAt')}>{formatDateTime(department.updatedAt)}</InfoField>
                <InfoField label={t('common:field.updatedBy')}>{department.updatedByName || department.updatedBy || '-'}</InfoField>
              </>
            )}
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              {t('common:button.close')}
            </Button>
            {canEdit && (
              <Button onClick={() => onEdit(departmentId)}>
                {t('common:button.edit')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </DrawerForm>
  );
}

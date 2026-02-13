import { Drawer, Button, Stack, Grid, Group } from '@mantine/core';
import { DrawerForm } from '@/components/common/DrawerForm';
import { StatusBadge } from '@/components/common/StatusBadge';
import { InfoField } from '@/components/common/InfoField';
import { SectionForm } from './SectionForm';
import { useSection, useCreateSection, useUpdateSection } from '../hooks/useSections';
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { formatDateTime } from '@/lib/date';
import type { SectionDrawerState, CreateSectionRequest, UpdateSectionRequest } from '../types';

interface Props {
  state: SectionDrawerState;
  onClose: () => void;
  onEdit: (sectionId: number) => void;
}

export function SectionDrawer({ state, onClose, onEdit }: Props) {
  const sectionId = 'sectionId' in state ? state.sectionId : 0;

  if (state.mode === 'create') {
    return <CreateContent opened onClose={onClose} />;
  }

  if (state.mode === 'edit') {
    return <EditContent opened sectionId={sectionId} onClose={onClose} />;
  }

  if (state.mode === 'detail') {
    return <DetailContent opened sectionId={sectionId} onClose={onClose} onEdit={onEdit} />;
  }

  return null;
}

// --- Create ---

function CreateContent({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation(['sections', 'common']);
  const { confirm } = useConfirm();
  const createSection = useCreateSection();

  const handleSubmit = async (data: CreateSectionRequest) => {
    const confirmed = await confirm({
      title: t('sections:confirm.create.title'),
      message: t('sections:confirm.create.message', { name: data.name }),
    });
    if (!confirmed) return;

    await createSection.mutateAsync(data);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('sections:page.createTitle')}
      position="right"
      size="lg"
    >
      <SectionForm onSubmit={handleSubmit} onCancel={onClose} isLoading={createSection.isPending} />
    </Drawer>
  );
}

// --- Edit ---

function EditContent({ opened, sectionId, onClose }: { opened: boolean; sectionId: number; onClose: () => void }) {
  const { t } = useTranslation(['sections']);
  const { confirm } = useConfirm();
  const { data: section, isLoading, error } = useSection(sectionId);
  const updateSection = useUpdateSection();

  const handleSubmit = async (data: UpdateSectionRequest) => {
    const confirmed = await confirm({
      title: t('sections:confirm.update.title'),
      message: t('sections:confirm.update.message', { name: section?.name }),
    });
    if (!confirmed) return;

    await updateSection.mutateAsync({ id: sectionId, data });
    onClose();
  };

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('sections:page.editTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('sections:message.sectionNotFound')}
    >
      {section && (
        <SectionForm initialData={section} onSubmit={handleSubmit} onCancel={onClose} isLoading={updateSection.isPending} />
      )}
    </DrawerForm>
  );
}

// --- Detail ---

function DetailContent({ opened, sectionId, onClose, onEdit }: { opened: boolean; sectionId: number; onClose: () => void; onEdit: (sectionId: number) => void }) {
  const { t } = useTranslation(['sections', 'common']);
  const userRole = useUserRole();
  const canEdit = hasRole([ROLE_ID.ADMIN], userRole);
  const { data: section, isLoading, error } = useSection(sectionId);

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('sections:page.detailTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('sections:message.sectionNotFound')}
    >
      {section && (
        <Stack gap="md">
          <Grid>
            <InfoField label={t('sections:field.department')}>{section.department?.name ?? '-'}</InfoField>
            <InfoField label={t('sections:field.name')}>{section.name}</InfoField>
            <InfoField label={t('sections:field.status')}><StatusBadge status={section.status} /></InfoField>
          </Grid>

          <Grid>
            <InfoField label={t('common:field.createdAt')}>{formatDateTime(section.createdAt)}</InfoField>
            <InfoField label={t('common:field.createdBy')}>{section.createdBy}</InfoField>
            {section.updatedAt && (
              <>
                <InfoField label={t('common:field.updatedAt')}>{formatDateTime(section.updatedAt)}</InfoField>
                <InfoField label={t('common:field.updatedBy')}>{section.updatedBy || '-'}</InfoField>
              </>
            )}
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              {t('common:button.close')}
            </Button>
            {canEdit && (
              <Button onClick={() => onEdit(sectionId)}>
                {t('common:button.edit')}
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </DrawerForm>
  );
}

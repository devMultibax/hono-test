import { Drawer, Button, Stack, Grid, Group, Badge } from '@mantine/core';
import { DrawerForm } from '@/components/common/DrawerForm';
import { InfoField } from '@/components/common/InfoField';
import { ChangelogForm } from './ChangelogForm';
import { useChangelog, useCreateChangelog, useUpdateChangelog } from '../hooks/useChangelogs';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { formatDate, formatDateTime } from '@/lib/date';
import { UPDATE_TYPE_COLORS } from '../types';
import type { ChangelogDrawerState, CreateChangelogRequest, UpdateChangelogRequest } from '../types';

interface Props {
  state: ChangelogDrawerState;
  onClose: () => void;
  onEdit: (changelogId: number) => void;
}

export function ChangelogDrawer({ state, onClose, onEdit }: Props) {
  const changelogId = 'changelogId' in state ? state.changelogId : 0;

  if (state.mode === 'create') {
    return <CreateContent opened onClose={onClose} />;
  }

  if (state.mode === 'edit') {
    return <EditContent opened changelogId={changelogId} onClose={onClose} />;
  }

  if (state.mode === 'detail') {
    return <DetailContent opened changelogId={changelogId} onClose={onClose} onEdit={onEdit} />;
  }

  return null;
}

// --- Create ---

function CreateContent({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation(['changelogs', 'common']);
  const { confirm } = useConfirm();
  const createChangelog = useCreateChangelog();

  const handleSubmit = async (data: CreateChangelogRequest) => {
    const confirmed = await confirm({
      title: t('changelogs:confirm.create.title'),
      message: t('changelogs:confirm.create.message', { title: data.title }),
    });
    if (!confirmed) return;

    await createChangelog.mutateAsync(data);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={t('changelogs:page.createTitle')}
      position="right"
      size="lg"
      closeOnClickOutside={!createChangelog.isPending}
      closeOnEscape={!createChangelog.isPending}
      withCloseButton={!createChangelog.isPending}
    >
      <ChangelogForm onSubmit={handleSubmit} onCancel={onClose} isLoading={createChangelog.isPending} />
    </Drawer>
  );
}

// --- Edit ---

function EditContent({ opened, changelogId, onClose }: { opened: boolean; changelogId: number; onClose: () => void }) {
  const { t } = useTranslation(['changelogs']);
  const { confirm } = useConfirm();
  const { data: changelog, isLoading, error } = useChangelog(changelogId);
  const updateChangelog = useUpdateChangelog();

  const handleSubmit = async (data: UpdateChangelogRequest) => {
    const confirmed = await confirm({
      title: t('changelogs:confirm.update.title'),
      message: t('changelogs:confirm.update.message', { title: changelog?.title }),
    });
    if (!confirmed) return;

    await updateChangelog.mutateAsync({ id: changelogId, data });
    onClose();
  };

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('changelogs:page.editTitle')}
      isLoading={isLoading}
      isSubmitting={updateChangelog.isPending}
      error={error}
      errorMessage={t('changelogs:message.notFound')}
    >
      {changelog && (
        <ChangelogForm initialData={changelog} onSubmit={handleSubmit} onCancel={onClose} isLoading={updateChangelog.isPending} />
      )}
    </DrawerForm>
  );
}

// --- Detail ---

function DetailContent({ opened, changelogId, onClose, onEdit }: { opened: boolean; changelogId: number; onClose: () => void; onEdit: (changelogId: number) => void }) {
  const { t } = useTranslation(['changelogs', 'common']);
  const { data: changelog, isLoading, error } = useChangelog(changelogId);

  return (
    <DrawerForm
      opened={opened}
      onClose={onClose}
      title={t('changelogs:page.detailTitle')}
      isLoading={isLoading}
      error={error}
      errorMessage={t('changelogs:message.notFound')}
    >
      {changelog && (
        <Stack gap="md">
          <Grid>
            <InfoField label={t('changelogs:field.title')}>{changelog.title}</InfoField>
            <InfoField label={t('changelogs:field.updateType')}>
              <Badge color={UPDATE_TYPE_COLORS[changelog.updateType]} variant="light" size="sm">
                {t(`changelogs:updateType.${changelog.updateType}`)}
              </Badge>
            </InfoField>
            <InfoField label={t('changelogs:field.updatedDate')}>{formatDate(changelog.updatedDate)}</InfoField>
            {changelog.gitRef && (
              <InfoField label={t('changelogs:field.gitRef')}>{changelog.gitRef}</InfoField>
            )}
          </Grid>

          {changelog.description && (
            <Grid>
              <InfoField label={t('changelogs:field.description')} span={{ base: 12, md: 12 }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{changelog.description}</div>
              </InfoField>
            </Grid>
          )}

          <Grid>
            <InfoField label={t('common:field.createdAt')}>{formatDateTime(changelog.createdAt)}</InfoField>
            <InfoField label={t('common:field.createdBy')}>{changelog.createdByName || changelog.createdBy}</InfoField>
            {changelog.updatedAt && (
              <>
                <InfoField label={t('common:field.updatedAt')}>{formatDateTime(changelog.updatedAt)}</InfoField>
                <InfoField label={t('common:field.updatedBy')}>{changelog.updatedByName || changelog.updatedBy || '-'}</InfoField>
              </>
            )}
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              {t('common:button.close')}
            </Button>
            <Button onClick={() => onEdit(changelogId)}>
              {t('common:button.edit')}
            </Button>
          </Group>
        </Stack>
      )}
    </DrawerForm>
  );
}

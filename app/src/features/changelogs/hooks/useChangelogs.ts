import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { changelogApi } from '@/api/services/changelog.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import { createCrudHooks } from '@/hooks/createCrudHooks';
import { useTranslation } from '@/lib/i18n';
import { ConfirmAsync } from '@/utils/mantineAlertUtils';
import type { ChangelogQueryParams, CreateChangelogRequest, UpdateChangelogRequest, Changelog } from '../types';

// === Query Keys ===

export const changelogKeys = createQueryKeys<ChangelogQueryParams>('changelogs');

// === CRUD Mutations (factory) ===

const { useUpdate, useDelete } = createCrudHooks<CreateChangelogRequest, UpdateChangelogRequest>({
  queryKeys: changelogKeys,
  api: {
    create: changelogApi.create,
    update: changelogApi.update,
    delete: changelogApi.delete,
  },
  messages: {
    createSuccess: 'changelogs:message.createSuccess',
    updateSuccess: 'changelogs:message.updateSuccess',
    deleteSuccess: 'changelogs:message.deleteSuccess',
  },
});

export {
  useUpdate as useUpdateChangelog,
  useDelete as useDeleteChangelog,
};

// === Queries ===

export function useCreateChangelog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changelogApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: changelogKeys.lists() });
    },
  });
}

export function useChangelogs(params: ChangelogQueryParams) {
  return useQuery({
    queryKey: changelogKeys.list(params),
    queryFn: () => changelogApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useChangelog(id: number) {
  return useQuery({
    queryKey: changelogKeys.detail(id),
    queryFn: () => changelogApi.getById(id).then((r) => r.data.data),
    enabled: id > 0,
  });
}

// === Action Handlers (with confirmation dialogs) ===

export function useChangelogActions() {
  const { t } = useTranslation(['changelogs']);
  const deleteChangelog = useDelete();

  const handleDelete = useCallback((changelog: Changelog) => {
    ConfirmAsync.show({
      title: t('changelogs:confirm.delete.title'),
      message: t('changelogs:confirm.delete.message', { title: changelog.title }),
      note: t('changelogs:confirm.irreversibleNote'),
      onConfirm: async () => {
        await deleteChangelog.mutateAsync(changelog.id);
      },
    });
  }, [deleteChangelog, t]);

  return {
    handleDelete,
    deletePendingId: deleteChangelog.isPending ? deleteChangelog.variables : undefined,
  };
}

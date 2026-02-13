import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionApi } from '@/api/services/section.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import { createCrudHooks } from '@/hooks/createCrudHooks';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Report } from '@/utils/mantineAlertUtils';
import type { SectionQueryParams, CreateSectionRequest, UpdateSectionRequest, Section, Status } from '../types';

// === Query Keys ===

export const sectionKeys = createQueryKeys<SectionQueryParams>('sections');

// === CRUD Mutations (factory) ===

const { useUpdate, useDelete, useBulkDelete } = createCrudHooks<CreateSectionRequest, UpdateSectionRequest>({
  queryKeys: sectionKeys,
  api: {
    create: sectionApi.create,
    update: sectionApi.update,
    delete: sectionApi.delete,
  },
  messages: {
    createSuccess: 'sections:message.createSuccess',
    updateSuccess: 'sections:message.updateSuccess',
    deleteSuccess: 'sections:message.deleteSuccess',
    bulkDeleteSuccess: 'sections:message.bulkDeleteSuccess',
  },
});

export {
  useUpdate as useUpdateSection,
  useDelete as useDeleteSection,
  useBulkDelete as useBulkDeleteSections,
};

// === Queries ===

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sectionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
    },
  });
}

export function useSections(params: SectionQueryParams) {
  return useQuery({
    queryKey: sectionKeys.list(params),
    queryFn: () => sectionApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useSection(id: number) {
  return useQuery({
    queryKey: sectionKeys.detail(id),
    queryFn: () => sectionApi.getById(id).then((r) => r.data),
    enabled: id > 0,
  });
}

export function useUpdateSectionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) =>
      sectionApi.update(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: sectionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sectionKeys.detail(id) });
    },
  });
}

// === Action Handlers (with confirmation dialogs) ===

export function useSectionActions() {
  const { t } = useTranslation(['sections']);
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const deleteSection = useDelete();
  const updateSectionStatus = useUpdateSectionStatus();
  const bulkDeleteSections = useBulkDelete();

  const handleDelete = useCallback(async (section: Section) => {
    const confirmed = await confirm({
      title: t('sections:confirm.delete.title'),
      message: t('sections:confirm.delete.message', { name: section.name }),
      note: t('sections:confirm.irreversibleNote'),
    });
    if (!confirmed) return;

    deleteSection.mutate(section.id);
  }, [confirm, deleteSection, t]);

  const handleStatusChange = useCallback(
    async (section: Section, status: Status) => {
      const confirmed = await confirm({
        title: t('sections:confirm.statusChange.title'),
        message: t('sections:confirm.statusChange.message', {
          name: section.name,
          status: t(`sections:status.${status}`),
        }),
      });
      if (!confirmed) return;

      await updateSectionStatus.mutateAsync({ id: section.id, status });
      Report.success(t('sections:message.statusChangeSuccess'));
    },
    [confirm, updateSectionStatus, t],
  );

  const handleBulkDelete = useCallback(
    async (selectedSections: Section[]) => {
      const confirmed = await confirm({
        title: t('sections:confirm.bulkDelete.title'),
        message: t('sections:confirm.bulkDelete.message', { count: selectedSections.length }),
        note: t('sections:confirm.irreversibleNote'),
      });
      if (!confirmed) return;

      bulkDeleteSections.mutate(selectedSections.map((s) => s.id));
    },
    [confirm, bulkDeleteSections, t],
  );

  const handleImportSuccess = useCallback(
    () => queryClient.invalidateQueries({ queryKey: sectionKeys.lists() }),
    [queryClient],
  );

  return {
    handleDelete,
    handleStatusChange,
    handleBulkDelete,
    handleImportSuccess,
  };
}

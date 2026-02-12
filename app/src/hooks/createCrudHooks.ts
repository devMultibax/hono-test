import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Report } from '@/utils/mantineAlertUtils';
import { t } from '@/lib/i18n/helpers';

interface CrudQueryKeys {
  lists: () => readonly unknown[];
  detail: (id: number) => readonly unknown[];
}

interface CrudApiConfig<TCreate, TUpdate> {
  queryKeys: CrudQueryKeys;
  api: {
    create: (data: TCreate) => Promise<unknown>;
    update: (id: number, data: TUpdate) => Promise<unknown>;
    delete: (id: number) => Promise<unknown>;
  };
  messages: {
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    bulkDeleteSuccess?: string;
  };
}

export function createCrudHooks<TCreate, TUpdate>(config: CrudApiConfig<TCreate, TUpdate>) {
  const { queryKeys, api, messages } = config;

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: api.create,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.lists() });
        Report.success(t(messages.createSuccess));
      },
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: TUpdate }) => api.update(id, data),
      onSuccess: (_, { id }) => {
        qc.invalidateQueries({ queryKey: queryKeys.lists() });
        qc.invalidateQueries({ queryKey: queryKeys.detail(id) });
        Report.success(t(messages.updateSuccess));
      },
    });
  }

  function useDelete() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: api.delete,
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.lists() });
        Report.success(t(messages.deleteSuccess));
      },
    });
  }

  function useBulkDelete() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (ids: number[]) => Promise.all(ids.map((id) => api.delete(id))),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: queryKeys.lists() });
        Report.success(t(messages.bulkDeleteSuccess ?? messages.deleteSuccess));
      },
    });
  }

  return { useCreate, useUpdate, useDelete, useBulkDelete };
}

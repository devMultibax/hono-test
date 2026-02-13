import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi } from '@/api/services/department.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import { createCrudHooks } from '@/hooks/createCrudHooks';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Report } from '@/utils/mantineAlertUtils';
import type { DepartmentQueryParams, CreateDepartmentRequest, UpdateDepartmentRequest, Department, Status } from '../types';

// === Query Keys ===

export const departmentKeys = createQueryKeys<DepartmentQueryParams>('departments');

// === CRUD Mutations (factory) ===

const { useUpdate, useDelete, useBulkDelete } = createCrudHooks<CreateDepartmentRequest, UpdateDepartmentRequest>({
  queryKeys: departmentKeys,
  api: {
    create: departmentApi.create,
    update: departmentApi.update,
    delete: departmentApi.delete,
  },
  messages: {
    createSuccess: 'departments:message.createSuccess',
    updateSuccess: 'departments:message.updateSuccess',
    deleteSuccess: 'departments:message.deleteSuccess',
    bulkDeleteSuccess: 'departments:message.bulkDeleteSuccess',
  },
});

export {
  useUpdate as useUpdateDepartment,
  useDelete as useDeleteDepartment,
  useBulkDelete as useBulkDeleteDepartments,
};

// === Queries ===

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
  });
}

export function useDepartments(params: DepartmentQueryParams) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentApi.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentApi.getById(id).then((r) => r.data),
    enabled: id > 0,
  });
}

export function useUpdateDepartmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) =>
      departmentApi.update(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id) });
    },
  });
}

// === Action Handlers (with confirmation dialogs) ===

export function useDepartmentActions() {
  const { t } = useTranslation(['departments']);
  const queryClient = useQueryClient();
  const { confirm } = useConfirm();
  const deleteDepartment = useDelete();
  const updateDepartmentStatus = useUpdateDepartmentStatus();
  const bulkDeleteDepartments = useBulkDelete();

  const handleDelete = useCallback(async (department: Department) => {
    const confirmed = await confirm({
      title: t('departments:confirm.delete.title'),
      message: t('departments:confirm.delete.message', { name: department.name }),
      note: t('departments:confirm.irreversibleNote'),
    });
    if (!confirmed) return;

    deleteDepartment.mutate(department.id);
  }, [confirm, deleteDepartment, t]);

  const handleStatusChange = useCallback(
    async (department: Department, status: Status) => {
      const confirmed = await confirm({
        title: t('departments:confirm.statusChange.title'),
        message: t('departments:confirm.statusChange.message', {
          name: department.name,
          status: t(`departments:status.${status}`),
        }),
      });
      if (!confirmed) return;

      await updateDepartmentStatus.mutateAsync({ id: department.id, status });
      Report.success(t('departments:message.statusChangeSuccess'));
    },
    [confirm, updateDepartmentStatus, t],
  );

  const handleBulkDelete = useCallback(
    async (selectedDepartments: Department[]) => {
      const confirmed = await confirm({
        title: t('departments:confirm.bulkDelete.title'),
        message: t('departments:confirm.bulkDelete.message', { count: selectedDepartments.length }),
        note: t('departments:confirm.irreversibleNote'),
      });
      if (!confirmed) return;

      bulkDeleteDepartments.mutate(selectedDepartments.map((d) => d.id));
    },
    [confirm, bulkDeleteDepartments, t],
  );

  const handleImportSuccess = useCallback(
    () => queryClient.invalidateQueries({ queryKey: departmentKeys.lists() }),
    [queryClient],
  );

  return {
    handleDelete,
    handleStatusChange,
    handleBulkDelete,
    handleImportSuccess,
  };
}

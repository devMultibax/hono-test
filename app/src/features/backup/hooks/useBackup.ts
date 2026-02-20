import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { backupApi } from '@/api/services/backup.api';
import { createQueryKeys } from '@/hooks/createQueryKeys';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Report } from '@/utils/mantineAlertUtils';

// === Query Keys ===

export const backupKeys = createQueryKeys('backups');

// === Queries ===

export function useBackups() {
  return useQuery({
    queryKey: backupKeys.lists(),
    queryFn: () => backupApi.getBackups().then((r) => r.data),
  });
}

// === Mutations ===

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefix: string | undefined) => backupApi.createBackup(prefix).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
    },
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename: string) => backupApi.restoreBackup(filename).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.lists() });
    },
  });
}

// === Action Handlers ===

export function useBackupActions() {
  const { t } = useTranslation(['backup']);
  const { confirm } = useConfirm();
  const createMutation = useCreateBackup();
  const restoreMutation = useRestoreBackup();

  // Use refs so callbacks don't need mutation objects in deps
  const createMutationRef = useRef(createMutation);
  const restoreMutationRef = useRef(restoreMutation);
  useEffect(() => {
    createMutationRef.current = createMutation;
    restoreMutationRef.current = restoreMutation;
  });

  const handleCreate = useCallback(async () => {
    const confirmed = await confirm({
      message: t('backup:confirm.create'),
    });
    if (!confirmed) return;

    try {
      await createMutationRef.current.mutateAsync(undefined);
      Report.success(t('backup:message.createSuccess'));
    } catch {
      // error already handled by interceptor
    }
  }, [confirm, t]);

  const handleRestore = useCallback(
    async (filename: string) => {
      const confirmed = await confirm({
        message: t('backup:confirm.restore', { filename }),
        note: t('backup:confirm.restoreNote'),
      });
      if (!confirmed) return;

      try {
        await restoreMutationRef.current.mutateAsync(filename);
        Report.success(t('backup:message.restoreSuccess'));
      } catch {
        // error already handled by interceptor
      }
    },
    [confirm, t],
  );

  return {
    handleCreate,
    handleRestore,
    isCreating: createMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { backupApi } from '@/api/services/backup.api';
import { useTranslation } from '@/lib/i18n';
import { useConfirm } from '@/hooks/useConfirm';
import { Report } from '@/utils/mantineAlertUtils';

// === Query Keys ===

export const backupKeys = {
  all: ['backups'] as const,
  list: () => [...backupKeys.all, 'list'] as const,
};

// === Queries ===

export function useBackups() {
  return useQuery({
    queryKey: backupKeys.list(),
    queryFn: () => backupApi.getBackups().then((r) => r.data),
  });
}

// === Mutations ===

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefix: string | undefined) => backupApi.createBackup(prefix).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
    },
  });
}

export function useRestoreBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename: string) => backupApi.restoreBackup(filename).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: backupKeys.list() });
    },
  });
}

// === Action Handlers ===

export function useBackupActions() {
  const { t } = useTranslation(['backup']);
  const { confirm } = useConfirm();
  const createMutation = useCreateBackup();
  const restoreMutation = useRestoreBackup();

  const handleCreate = useCallback(async () => {
    const confirmed = await confirm({
      message: t('backup:confirm.create'),
    });
    if (!confirmed) return;

    try {
      await createMutation.mutateAsync(undefined);
      Report.success(t('backup:message.createSuccess'));
    } catch {
      // error already handled by interceptor
    }
  }, [confirm, createMutation, t]);

  const handleRestore = useCallback(
    async (filename: string) => {
      const confirmed = await confirm({
        message: t('backup:confirm.restore', { filename }),
        note: t('backup:confirm.restoreNote'),
      });
      if (!confirmed) return;

      try {
        await restoreMutation.mutateAsync(filename);
        Report.success(t('backup:message.restoreSuccess'));
      } catch {
        // error already handled by interceptor
      }
    },
    [confirm, restoreMutation, t],
  );

  return {
    handleCreate,
    handleRestore,
    isCreating: createMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

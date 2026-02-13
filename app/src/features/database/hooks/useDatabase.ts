import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { databaseApi } from '@/api/services/database.api';
import { useTranslation } from '@/lib/i18n';
import { Report } from '@/utils/mantineAlertUtils';

// === Query Keys ===

export const databaseKeys = {
  all: ['database'] as const,
  statistics: () => [...databaseKeys.all, 'statistics'] as const,
};

// === Queries ===

export function useDatabaseStatistics() {
  return useQuery({
    queryKey: databaseKeys.statistics(),
    queryFn: () => databaseApi.getStatistics().then((r) => r.data),
  });
}

// === Mutations ===

export function useAnalyzeDatabase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => databaseApi.analyze().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: databaseKeys.statistics() });
    },
  });
}

// === Action Handlers ===

export function useDatabaseActions() {
  const { t } = useTranslation(['database']);
  const analyzeMutation = useAnalyzeDatabase();

  const handleAnalyze = useCallback(async () => {
    try {
      await analyzeMutation.mutateAsync();
      Report.success(t('database:message.analyzeSuccess'));
    } catch {
      // error already handled by interceptor
    }
  }, [analyzeMutation, t]);

  return {
    handleAnalyze,
    isAnalyzing: analyzeMutation.isPending,
  };
}

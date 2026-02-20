import { apiClient } from '../client';
import type { BackupFile } from '@/types';

interface BackupListResponse {
  backups: BackupFile[];
  total: number;
}

export const backupApi = {
  getBackups: () =>
    apiClient.get<{ data: BackupListResponse }>('/backup'),

  createBackup: (prefix?: string) =>
    apiClient.post('/backup', { prefix }),

  restoreBackup: (filename: string) =>
    apiClient.post(`/backup/${filename}/restore`),
};

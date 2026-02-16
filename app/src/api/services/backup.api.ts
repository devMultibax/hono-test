import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { BackupFile } from '@/types';

interface BackupListResponse {
  backups: BackupFile[];
  total: number;
}

export const backupApi = {
  getBackups: () =>
    apiClient.get<BackupListResponse>(API_ENDPOINTS.BACKUP.BASE),

  createBackup: (prefix?: string) =>
    apiClient.post(API_ENDPOINTS.BACKUP.BASE, { prefix }),

  restoreBackup: (filename: string) =>
    apiClient.post(API_ENDPOINTS.BACKUP.RESTORE(filename)),
};

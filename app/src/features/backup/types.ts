import type { BackupFile, BackupType } from '@/types';

// Re-export for use within feature
export type { BackupFile, BackupType };

export interface BackupListResponse {
  backups: BackupFile[];
  total: number;
}

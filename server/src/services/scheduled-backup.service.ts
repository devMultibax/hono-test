import cron from 'node-cron'
import { BackupService } from './backup.service'

const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000
const CRON_SCHEDULE = '0 2 * * *' // Daily at 02:00 AM

export class ScheduledBackupService {
  static init(): void {
    cron.schedule(CRON_SCHEDULE, () => this.runScheduledBackup())
    console.log('[BACKUP] Scheduled Backup Service initialized (Daily at 02:00 AM)')
  }

  private static async runScheduledBackup(): Promise<void> {
    console.log('[BACKUP] Starting scheduled daily backup...')

    try {
      const { filename } = await BackupService.createBackup('auto', 'daily')
      console.log(`[BACKUP] Scheduled backup created: ${filename}`)

      await this.cleanupOldBackups()
    } catch (error) {
      console.error(`[BACKUP] Scheduled backup failed: ${(error as Error).message}`)
    }
  }

  private static async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await BackupService.getBackups()
      const now = Date.now()

      const oldBackups = backups.filter((backup) => {
        const backupTime = new Date(backup.date).getTime()
        return now - backupTime > RETENTION_MS
      })

      if (oldBackups.length === 0) return

      console.log(`[BACKUP] Found ${oldBackups.length} old backups to cleanup`)

      for (const backup of oldBackups) {
        try {
          await BackupService.deleteBackup(backup.filename)
          console.log(`[BACKUP] Deleted old backup: ${backup.filename}`)
        } catch (err) {
          console.warn(`[BACKUP] Failed to delete backup ${backup.filename}: ${(err as Error).message}`)
        }
      }
    } catch (error) {
      console.error(`[BACKUP] Failed to cleanup old backups: ${(error as Error).message}`)
    }
  }
}

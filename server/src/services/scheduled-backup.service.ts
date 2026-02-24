import cron from 'node-cron'
import { BackupService } from './backup.service'
import { logSystem } from '../lib/logger'

const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000
const CRON_SCHEDULE = '0 2 * * *' // Daily at 02:00 AM

export class ScheduledBackupService {
  static init(): void {
    cron.schedule(CRON_SCHEDULE, () => this.runScheduledBackup())
    console.log('\x1b[36m[INFO]\x1b[0m [SYSTEM] Scheduled Backup Service initialized (Daily at 02:00 AM)')
  }

  private static async runScheduledBackup(): Promise<void> {
    logSystem.info({ event: 'Starting scheduled daily backup...' })

    try {
      const { filename } = await BackupService.createBackup('auto', 'daily')
      logSystem.info({ event: `Scheduled backup created: ${filename}` })

      await this.cleanupOldBackups()
    } catch (error) {
      logSystem.error({ event: 'Scheduled backup failed', detail: (error as Error).message })
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

      logSystem.info({ event: `Found ${oldBackups.length} old backups to cleanup` })

      for (const backup of oldBackups) {
        try {
          await BackupService.deleteBackup(backup.filename)
          logSystem.info({ event: `Deleted old backup: ${backup.filename}` })
        } catch (err) {
          logSystem.warn({ event: `Failed to delete backup ${backup.filename}`, detail: (err as Error).message })
        }
      }
    } catch (error) {
      logSystem.error({ event: 'Failed to cleanup old backups', detail: (error as Error).message })
    }
  }
}

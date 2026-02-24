import cron from 'node-cron'
import { BackupService } from './backup.service'
import { logSystem } from '../lib/logger'
import { LogEvent } from '../constants/log-events'
import { daysToMs } from '../utils/time.utils'

const RETENTION_DAYS = 30
const RETENTION_MS = daysToMs(RETENTION_DAYS)
const CRON_SCHEDULE = '0 2 * * *' // Daily at 02:00 AM

export class ScheduledBackupService {
  static init(): void {
    cron.schedule(CRON_SCHEDULE, () => this.runScheduledBackup())
    console.log('\x1b[36m[INFO]\x1b[0m [SYSTEM] Scheduled Backup Service initialized (Daily at 02:00 AM)')
  }

  private static async runScheduledBackup(): Promise<void> {
    logSystem.info({ event: LogEvent.SCHED_BACKUP_STARTED })

    try {
      const { filename } = await BackupService.createBackup('auto', 'daily')
      logSystem.info({ event: LogEvent.SCHED_BACKUP_COMPLETED(filename) })

      await this.cleanupOldBackups()
    } catch (error) {
      logSystem.error({ event: LogEvent.SCHED_BACKUP_FAILED, detail: (error as Error).message })
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

      logSystem.info({ event: LogEvent.SCHED_FOUND_EXPIRED_BACKUPS(oldBackups.length) })

      for (const backup of oldBackups) {
        try {
          await BackupService.deleteBackup(backup.filename)
          logSystem.info({ event: LogEvent.SCHED_DELETED_BACKUP(backup.filename) })
        } catch (err) {
          logSystem.warn({ event: LogEvent.SCHED_DELETE_BACKUP_FAILED(backup.filename), detail: (err as Error).message })
        }
      }
    } catch (error) {
      logSystem.error({ event: LogEvent.SCHED_CLEANUP_BACKUPS_FAILED, detail: (error as Error).message })
    }
  }
}

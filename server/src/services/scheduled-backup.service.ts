import cron from 'node-cron'
import { BackupService } from './backup.service'
import { logger } from '../lib/logger'

const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000
const CRON_SCHEDULE = '0 2 * * *' // Daily at 02:00 AM

export class ScheduledBackupService {
  static init(): void {
    cron.schedule(CRON_SCHEDULE, () => this.runScheduledBackup())
    logger.info('Scheduled Backup Service initialized (Daily at 02:00 AM)')
  }

  private static async runScheduledBackup(): Promise<void> {
    logger.info('Starting scheduled daily backup...')

    try {
      const { filename } = await BackupService.createBackup('auto', 'daily')
      logger.info(`Scheduled backup created: ${filename}`)

      await this.cleanupOldBackups()
    } catch (error) {
      logger.error(`Scheduled backup failed: ${(error as Error).message}`)
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

      logger.info(`Found ${oldBackups.length} old backups to cleanup`)

      for (const backup of oldBackups) {
        try {
          await BackupService.deleteBackup(backup.filename)
          logger.info(`Deleted old backup: ${backup.filename}`)
        } catch (err) {
          logger.warn(`Failed to delete backup ${backup.filename}: ${(err as Error).message}`)
        }
      }
    } catch (error) {
      logger.error(`Failed to cleanup old backups: ${(error as Error).message}`)
    }
  }
}

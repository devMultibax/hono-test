import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { LOG_DIR, logSystem } from '../lib/logger'

const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000
const CRON_SCHEDULE = '0 1 * * *' // Daily at 01:00 AM
const LOG_FILE_PATTERN = /^app-.*\.log$/

export class ScheduledLogService {
  static init(): void {
    cron.schedule(CRON_SCHEDULE, () => this.cleanupOldLogs())
    logSystem.info({ event: 'Scheduled Log Service initialized (Daily at 01:00 AM)' })
  }

  private static async cleanupOldLogs(): Promise<void> {
    logSystem.info({ event: 'Starting scheduled log cleanup...' })

    try {
      const files = await fs.readdir(LOG_DIR)
      const logFiles = files.filter(file => LOG_FILE_PATTERN.test(file))

      const now = Date.now()
      const oldFiles = await this.findOldFiles(logFiles, now)

      if (oldFiles.length === 0) return

      logSystem.info({ event: `Found ${oldFiles.length} old logs to cleanup` })
      await this.deleteFiles(oldFiles)
    } catch (error) {
      logSystem.error({ event: 'Failed to cleanup old logs', detail: (error as Error).message })
    }
  }

  private static async findOldFiles(
    logFiles: string[],
    now: number
  ): Promise<Array<{ file: string; filePath: string }>> {
    const oldFiles: Array<{ file: string; filePath: string }> = []

    for (const file of logFiles) {
      const filePath = path.join(LOG_DIR, file)

      try {
        const stats = await fs.stat(filePath)
        if (now - stats.mtimeMs > RETENTION_MS) {
          oldFiles.push({ file, filePath })
        }
      } catch (err) {
        logSystem.warn({ event: `Failed to stat log file ${file}`, detail: (err as Error).message })
      }
    }

    return oldFiles
  }

  private static async deleteFiles(
    files: Array<{ file: string; filePath: string }>
  ): Promise<void> {
    for (const { file, filePath } of files) {
      try {
        await fs.unlink(filePath)
        logSystem.info({ event: `Deleted old log: ${file}` })
      } catch (err) {
        logSystem.warn({ event: `Failed to delete log ${file}`, detail: (err as Error).message })
      }
    }
  }
}

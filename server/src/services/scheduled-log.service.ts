import cron from 'node-cron'
import fs from 'fs/promises'
import path from 'path'
import { LOG_DIR, logSystem } from '../lib/logger'
import { LogEvent } from '../constants/log-events'
import { daysToMs } from '../utils/time.utils'

const RETENTION_DAYS = 30
const RETENTION_MS = daysToMs(RETENTION_DAYS)
const CRON_SCHEDULE = '0 1 * * *' // Daily at 01:00 AM
const LOG_FILE_PATTERN = /^app-.*\.log$/

export class ScheduledLogService {
  static init(): void {
    cron.schedule(CRON_SCHEDULE, () => this.cleanupOldLogs())
    console.log('\x1b[36m[INFO]\x1b[0m [SYSTEM] Scheduled Log Service initialized (Daily at 01:00 AM)')
  }

  private static async cleanupOldLogs(): Promise<void> {
    logSystem.info({ event: LogEvent.SCHED_LOG_CLEANUP_STARTED })

    try {
      const files = await fs.readdir(LOG_DIR)
      const logFiles = files.filter(file => LOG_FILE_PATTERN.test(file))

      const now = Date.now()
      const oldFiles = await this.findOldFiles(logFiles, now)

      if (oldFiles.length === 0) return

      logSystem.info({ event: LogEvent.SCHED_FOUND_EXPIRED_LOGS(oldFiles.length) })
      await this.deleteFiles(oldFiles)
    } catch (error) {
      logSystem.error({ event: LogEvent.SCHED_CLEANUP_LOGS_FAILED, detail: (error as Error).message })
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
        logSystem.warn({ event: LogEvent.SCHED_READ_LOG_FAILED(file), detail: (err as Error).message })
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
        logSystem.info({ event: LogEvent.SCHED_DELETED_LOG(file) })
      } catch (err) {
        logSystem.warn({ event: LogEvent.SCHED_DELETE_LOG_FAILED(file), detail: (err as Error).message })
      }
    }
  }
}

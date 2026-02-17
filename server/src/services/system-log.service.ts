import fs from 'fs/promises'
import { existsSync, createReadStream } from 'fs'
import path from 'path'
import readline from 'readline'
import { LOG_DIR } from '../lib/logger'
import type { LogEntry, LogFile, LogQuery } from '../schemas/system-log.schema'

const LOG_FILE_PATTERN = /^app-(\d{4}-\d{2}-\d{2})\.log$/
const DEFAULT_DAYS_TO_KEEP = 30

export class SystemLogService {
  static async getLogFiles(): Promise<LogFile[]> {
    if (!existsSync(LOG_DIR)) {
      return []
    }

    const entries = await fs.readdir(LOG_DIR)
    const logFiles = entries.filter(file => LOG_FILE_PATTERN.test(file))

    const files = await Promise.all(
      logFiles.map(async (filename) => {
        const filePath = path.join(LOG_DIR, filename)
        const stats = await fs.stat(filePath)
        const dateMatch = filename.match(LOG_FILE_PATTERN)

        return {
          filename,
          date: dateMatch?.[1] ?? 'unknown',
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size)
        }
      })
    )

    return files.sort((a, b) => b.date.localeCompare(a.date))
  }

  static async getLogs(query: LogQuery): Promise<LogEntry[]> {
    const { date, startDate, endDate, level, limit } = query

    // Determine which log files to read
    const logDates = this.getLogDates(date, startDate, endDate)

    const logs: LogEntry[] = []

    for (const targetDate of logDates) {
      const logFile = path.join(LOG_DIR, `app-${targetDate}.log`)

      if (!existsSync(logFile)) continue

      const fileStream = createReadStream(logFile)
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      })

      for await (const line of rl) {
        if (!line.trim()) continue

        try {
          const entry = JSON.parse(line) as LogEntry

          if (level && entry.level !== level) continue

          logs.push(entry)

          if (logs.length >= limit) break
        } catch {
          continue
        }
      }

      if (logs.length >= limit) break
    }

    return logs.reverse()
  }

  private static getLogDates(date?: string, startDate?: string, endDate?: string): string[] {
    // Single date mode (backward compatible)
    if (date) return [date]

    // Date range mode
    if (startDate && endDate) {
      const dates: string[] = []
      const current = new Date(startDate)
      const end = new Date(endDate)

      while (current <= end) {
        dates.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
      return dates
    }

    // Default: today
    return [new Date().toISOString().split('T')[0]]
  }

  static async cleanupOldLogs(daysToKeep = DEFAULT_DAYS_TO_KEEP): Promise<number> {
    if (!existsSync(LOG_DIR)) {
      return 0
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const entries = await fs.readdir(LOG_DIR)
    const logFiles = entries.filter(file => LOG_FILE_PATTERN.test(file))

    let deletedCount = 0

    for (const filename of logFiles) {
      const dateMatch = filename.match(LOG_FILE_PATTERN)
      if (!dateMatch) continue

      const fileDate = new Date(dateMatch[1])
      if (fileDate < cutoffDate) {
        await fs.unlink(path.join(LOG_DIR, filename))
        deletedCount++
      }
    }

    return deletedCount
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
}

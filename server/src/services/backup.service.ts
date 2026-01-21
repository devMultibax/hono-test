import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'
import { env } from '../config/env'
import { NotFoundError } from '../lib/errors'
import type { BackupFile } from '../schemas/backup.schema'

const execAsync = promisify(exec)

const BACKUP_DIR = path.resolve(process.cwd(), 'storage/backups')
const BACKUP_FILE_PATTERN = /^backup-(?:.+-)?(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})\.sql$/
const BACKUP_EXTENSIONS = ['.sql', '.dump']

function getPgCommand(command: string): string {
  if (env.PG_BIN_PATH) {
    return `"${path.join(env.PG_BIN_PATH, command)}"`
  }
  return command
}

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

export class BackupService {
  static async getBackups(): Promise<BackupFile[]> {
    if (!existsSync(BACKUP_DIR)) {
      return []
    }

    const entries = await fs.readdir(BACKUP_DIR)
    const backupFiles = entries.filter(file =>
      BACKUP_EXTENSIONS.some(ext => file.endsWith(ext))
    )

    const files = await Promise.all(
      backupFiles.map(async (filename) => {
        const filePath = path.join(BACKUP_DIR, filename)
        const stats = await fs.stat(filePath)
        const date = this.extractDateFromFilename(filename, stats.birthtime)

        return {
          filename,
          date,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size)
        }
      })
    )

    return files.sort((a, b) => b.date.localeCompare(a.date))
  }

  static async createBackup(prefix?: string): Promise<{ filename: string; path: string }> {
    const timestamp = this.generateTimestamp()
    const filename = prefix
      ? `backup-${prefix}-${timestamp}.sql`
      : `backup-${timestamp}.sql`
    const filePath = path.join(BACKUP_DIR, filename)

    const password = this.extractPassword()

    try {
      const pgDump = getPgCommand('pg_dump')
      await execAsync(`${pgDump} "${env.DATABASE_URL}" -f "${filePath}"`, {
        env: { ...process.env, PGPASSWORD: password }
      })

      return { filename, path: filePath }
    } catch (error) {
      await this.cleanupEmptyFile(filePath)
      throw error
    }
  }

  static async restoreBackup(filename: string): Promise<void> {
    const filePath = await this.validateBackupExists(filename)
    const password = this.extractPassword()

    const psql = getPgCommand('psql')
    await execAsync(`${psql} "${env.DATABASE_URL}" -f "${filePath}"`, {
      env: { ...process.env, PGPASSWORD: password }
    })
  }

  static async deleteBackup(filename: string): Promise<void> {
    const filePath = await this.validateBackupExists(filename)
    await fs.unlink(filePath)
  }

  static async getBackupInfo(filename: string): Promise<{ filePath: string; size: number }> {
    const filePath = await this.validateBackupExists(filename)
    const stats = await fs.stat(filePath)
    return { filePath, size: stats.size }
  }

  private static async validateBackupExists(filename: string): Promise<string> {
    const filePath = path.join(BACKUP_DIR, filename)

    if (!existsSync(filePath)) {
      throw new NotFoundError('Backup file not found')
    }

    return filePath
  }

  private static extractDateFromFilename(filename: string, fallbackDate: Date): string {
    const dateMatch = filename.match(BACKUP_FILE_PATTERN)

    if (dateMatch) {
      const [y, m, d, h, min, s] = dateMatch[1].split('-')
      return `${y}-${m}-${d} ${h}:${min}:${s}`
    }

    return fallbackDate.toISOString().split('T')[0]
  }

  private static generateTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/T/, '-')
      .replace(/\..+/, '')
      .replace(/:/g, '-')
  }

  private static extractPassword(): string {
    const connectionUrl = new URL(env.DATABASE_URL)
    return connectionUrl.password
  }

  private static async cleanupEmptyFile(filePath: string): Promise<void> {
    if (!existsSync(filePath)) return

    try {
      const stats = await fs.stat(filePath)
      if (stats.size === 0) {
        await fs.unlink(filePath)
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
}

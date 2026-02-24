import fs from 'fs/promises'
import { existsSync, mkdirSync, statSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { env } from '../config/env'
import { NotFoundError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import { logSystem } from '../lib/logger'
import { LogEvent } from '../constants/log-events'
import { formatBytes } from '../utils/format.utils'
import { spawnCommand } from '../utils/process.utils'
import type { BackupFile } from '../schemas/backup.schema'

const BACKUP_DIR = path.resolve(process.cwd(), 'storage/backups')
const BACKUP_EXTENSIONS = ['.backup', '.sql', '.dump']
const METADATA_FILE = path.join(BACKUP_DIR, '.backup-metadata.json')

// Filename patterns for type inference (same as old express system)
const DAILY_PATTERN = /_backup_\d{8}\.\w+$/   // 8 digits = YYYYMMDD
const YEARLY_PATTERN = /_backup_\d{4}\.\w+$/  // 4 digits = YYYY

interface BackupMetadata {
  [filename: string]: {
    restoredAt?: string
  }
}

function getPgCommand(command: string): string {
  if (env.PG_BIN_PATH) {
    return path.join(env.PG_BIN_PATH, command)
  }
  return command
}

function getDbConnectionArgs(): { host: string; port: string; user: string; database: string; password: string } {
  const url = new URL(env.DATABASE_URL)
  return {
    host: url.hostname,
    port: url.port || '5432',
    user: url.username,
    database: url.pathname.slice(1),
    password: decodeURIComponent(url.password)
  }
}

if (!existsSync(BACKUP_DIR)) {
  mkdirSync(BACKUP_DIR, { recursive: true })
}

export class BackupService {
  // === Metadata Management ===

  private static loadMetadata(): BackupMetadata {
    try {
      if (existsSync(METADATA_FILE)) {
        const data = readFileSync(METADATA_FILE, 'utf-8')
        return JSON.parse(data)
      }
    } catch {
      // Ignore parse errors, return empty
    }
    return {}
  }

  private static saveMetadata(metadata: BackupMetadata): void {
    writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8')
  }

  static setRestoredAt(filename: string): void {
    const metadata = this.loadMetadata()
    if (!metadata[filename]) {
      metadata[filename] = {}
    }
    metadata[filename].restoredAt = new Date().toISOString()
    this.saveMetadata(metadata)
  }

  private static inferType(filename: string): 'daily' | 'yearly' | 'manual' {
    if (DAILY_PATTERN.test(filename)) return 'daily'
    if (YEARLY_PATTERN.test(filename)) return 'yearly'
    return 'manual'
  }

  // === CRUD Operations ===

  static async getBackups(): Promise<BackupFile[]> {
    if (!existsSync(BACKUP_DIR)) {
      return []
    }

    const entries = readdirSync(BACKUP_DIR)
    const backupFiles = entries.filter(file =>
      BACKUP_EXTENSIONS.some(ext => file.endsWith(ext))
    )

    const metadata = this.loadMetadata()

    const files = await Promise.all(
      backupFiles.map(async (filename) => {
        const filePath = path.join(BACKUP_DIR, filename)
        const stats = statSync(filePath)
        const fileMeta = metadata[filename]

        return {
          filename,
          type: this.inferType(filename),
          date: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          restoredAt: fileMeta?.restoredAt ?? null,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size)
        }
      })
    )

    return files.sort((a, b) => b.date.localeCompare(a.date))
  }

  static async createBackup(prefix?: string, type: 'daily' | 'yearly' = 'yearly'): Promise<{ filename: string; path: string }> {
    const db = getDbConnectionArgs()
    const now = new Date()
    const dateSuffix = type === 'daily'
      ? `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      : `${now.getFullYear()}`
    const namePrefix = prefix || db.database
    const filename = `${namePrefix}_backup_${dateSuffix}.backup`
    const filePath = path.join(BACKUP_DIR, filename)

    const args = [
      '-h', db.host,
      '-p', db.port,
      '-U', db.user,
      '-d', db.database,
      '-Fc', '-b', '-v',
      '-f', filePath
    ]

    logSystem.info({ event: LogEvent.BACKUP_STARTED(filename) })

    try {
      const { code, stderr } = await spawnCommand(
        getPgCommand('pg_dump'),
        args,
        { ...process.env, PGPASSWORD: db.password }
      )

      if (code === 0 && existsSync(filePath)) {
        logSystem.info({ event: LogEvent.BACKUP_COMPLETED(filename) })
        return { filename, path: filePath }
      }

      logSystem.error({ event: LogEvent.BACKUP_FAILED(filename), detail: stderr })
      await this.cleanupEmptyFile(filePath)
      throw new Error(`Backup failed: ${stderr}`)
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Backup failed:')) throw err
      const message = err instanceof Error ? err.message : String(err)
      logSystem.error({ event: LogEvent.BACKUP_PROCESS_FAILED, detail: message })
      await this.cleanupEmptyFile(filePath)
      throw new Error(`Failed to start pg_dump: ${message}`)
    }
  }

  static async restoreBackup(filename: string): Promise<void> {
    const filePath = await this.validateBackupExists(filename)
    const db = getDbConnectionArgs()
    const targetDbName = this.getDatabaseNameFromFileName(filename)
    const execEnv = { ...process.env, PGPASSWORD: db.password }

    // Step 1: Create database if not exists
    logSystem.info({ event: LogEvent.DB_CREATION_STARTED(targetDbName) })

    const { code: createCode, stderr: createStderr } = await spawnCommand(
      getPgCommand('psql'),
      ['-h', db.host, '-p', db.port, '-U', db.user, '-d', 'postgres', '-c', `CREATE DATABASE "${targetDbName}";`],
      execEnv
    )

    if (createCode !== 0 && !createStderr.includes('already exists')) {
      logSystem.error({ event: LogEvent.DB_CREATION_FAILED(targetDbName), detail: createStderr })
      throw new Error(`Failed to create database: ${createStderr}`)
    }

    logSystem.info({ event: LogEvent.DB_CREATED(targetDbName) })

    // Step 2: Restore backup to target database
    logSystem.info({ event: LogEvent.DB_RESTORE_STARTED(targetDbName) })

    const { code: restoreCode, stderr: restoreStderr } = await spawnCommand(
      getPgCommand('pg_restore'),
      ['-h', db.host, '-p', db.port, '-U', db.user, '-d', targetDbName, '--clean', '--if-exists', '-v', filePath],
      execEnv
    )

    // pg_restore returns 0 for success, 1 for warnings (which is OK)
    if (restoreCode !== 0 && restoreCode !== 1) {
      logSystem.error({ event: LogEvent.DB_RESTORE_FAILED(targetDbName), detail: restoreStderr })
      throw new Error(`Restore failed: ${restoreStderr}`)
    }

    if (restoreStderr) {
      logSystem.warn({ event: LogEvent.DB_RESTORE_WARNINGS(targetDbName), detail: restoreStderr })
    }

    this.setRestoredAt(filename)
    logSystem.info({ event: LogEvent.DB_RESTORED(targetDbName) })
  }

  static async deleteBackup(filename: string): Promise<void> {
    const filePath = await this.validateBackupExists(filename)
    await fs.unlink(filePath)

    // Clean up metadata for deleted file
    const metadata = this.loadMetadata()
    if (metadata[filename]) {
      delete metadata[filename]
      this.saveMetadata(metadata)
    }
  }

  private static getDatabaseNameFromFileName(fileName: string): string {
    // Remove extension (.backup, .sql, .dump)
    const dbName = fileName.replace(/\.(backup|sql|dump)$/, '')
    return this.validateDatabaseName(dbName)
  }

  private static validateDatabaseName(dbName: string): string {
    const validNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/

    if (!validNameRegex.test(dbName)) {
      throw new Error(
        `Invalid database name: "${dbName}". ` +
        'Database name must start with a letter or underscore, ' +
        'contain only alphanumeric characters and underscores.'
      )
    }

    const reservedNames = ['postgres', 'template0', 'template1']
    if (reservedNames.includes(dbName.toLowerCase())) {
      throw new Error(`Cannot use reserved database name: "${dbName}"`)
    }

    return dbName
  }

  private static async validateBackupExists(filename: string): Promise<string> {
    const filePath = path.join(BACKUP_DIR, filename)

    if (!existsSync(filePath)) {
      throw new NotFoundError(CODES.BACKUP_FILE_NOT_FOUND, MSG.errors.backup.fileNotFound)
    }

    return filePath
  }

  private static async cleanupEmptyFile(filePath: string): Promise<void> {
    if (!existsSync(filePath)) return

    try {
      const stats = statSync(filePath)
      if (stats.size === 0) {
        await fs.unlink(filePath)
      }
    } catch {
      // Ignore cleanup errors
    }
  }

}

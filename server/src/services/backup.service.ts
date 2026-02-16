import { spawn } from 'child_process'
import fs from 'fs/promises'
import { existsSync, mkdirSync, statSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { env } from '../config/env'
import { NotFoundError } from '../lib/errors'
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
          sizeFormatted: this.formatBytes(stats.size)
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

    return new Promise((resolve, reject) => {
      const pgDump = getPgCommand('pg_dump')

      const args = [
        '-h', db.host,
        '-p', db.port,
        '-U', db.user,
        '-d', db.database,
        '-Fc', '-b', '-v',
        '-f', filePath
      ]

      console.log(`Creating backup: ${filename}`)

      const process_spawn = spawn(pgDump, args, {
        env: { ...process.env, PGPASSWORD: db.password }
      })

      let stderr = ''

      process_spawn.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      process_spawn.on('close', async (code) => {
        if (code === 0 && existsSync(filePath)) {
          console.log(`Backup created successfully: ${filename}`)
          resolve({ filename, path: filePath })
        } else {
          console.error('Backup failed:', stderr)
          await this.cleanupEmptyFile(filePath)
          reject(new Error(`Backup failed: ${stderr}`))
        }
      })

      process_spawn.on('error', async (err) => {
        console.error('Failed to start pg_dump:', err)
        await this.cleanupEmptyFile(filePath)
        reject(new Error(`Failed to start pg_dump: ${err.message}`))
      })
    })
  }

  static async restoreBackup(filename: string): Promise<void> {
    const filePath = await this.validateBackupExists(filename)
    const db = getDbConnectionArgs()

    // Get target database name from filename (e.g., "hono_backup_2026.backup" -> "hono_backup_2026")
    const targetDbName = this.getDatabaseNameFromFileName(filename)

    return new Promise((resolve, reject) => {
      const psql = getPgCommand('psql')
      const pgRestore = getPgCommand('pg_restore')
      const execEnv = { ...process.env, PGPASSWORD: db.password }

      // Step 1: Create database if not exists
      const createDbArgs = [
        '-h', db.host,
        '-p', db.port,
        '-U', db.user,
        '-d', 'postgres',
        '-c', `CREATE DATABASE "${targetDbName}";`
      ]

      console.log(`Creating database: ${targetDbName}`)

      const psqlCreate = spawn(psql, createDbArgs, { env: execEnv })

      let createStderr = ''

      psqlCreate.stderr.on('data', (data) => {
        createStderr += data.toString()
      })

      psqlCreate.on('close', (createCode) => {
        // Ignore "already exists" error
        if (createCode !== 0 && !createStderr.includes('already exists')) {
          console.error('Create database error:', createStderr)
          reject(new Error(`Failed to create database: ${createStderr}`))
          return
        }

        console.log(`Database "${targetDbName}" is ready`)

        // Step 2: Restore backup to target database
        const restoreArgs = [
          '-h', db.host,
          '-p', db.port,
          '-U', db.user,
          '-d', targetDbName,
          '--clean',
          '--if-exists',
          '-v',
          filePath
        ]

        console.log(`Restoring backup to database: ${targetDbName}`)

        const pgRestoreProcess = spawn(pgRestore, restoreArgs, { env: execEnv })

        let restoreStderr = ''

        pgRestoreProcess.stderr.on('data', (data) => {
          restoreStderr += data.toString()
        })

        pgRestoreProcess.on('close', (restoreCode) => {
          // pg_restore returns 0 for success, 1 for warnings (which is OK)
          if (restoreCode !== 0 && restoreCode !== 1) {
            console.error('Restore error:', restoreStderr)
            reject(new Error(`Restore failed: ${restoreStderr}`))
            return
          }

          if (restoreStderr) {
            console.log('Restore warnings:', restoreStderr)
          }

          // Track restore timestamp
          this.setRestoredAt(filename)

          console.log(`Database restored successfully to "${targetDbName}"`)
          resolve()
        })

        pgRestoreProcess.on('error', (err) => {
          console.error('Failed to start pg_restore:', err)
          reject(new Error(`Failed to start pg_restore: ${err.message}`))
        })
      })

      psqlCreate.on('error', (err) => {
        console.error('Failed to start psql:', err)
        reject(new Error(`Failed to start psql: ${err.message}`))
      })
    })
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

  static async getBackupInfo(filename: string): Promise<{ filePath: string; size: number }> {
    const filePath = await this.validateBackupExists(filename)
    const stats = statSync(filePath)
    return { filePath, size: stats.size }
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
      throw new NotFoundError('Backup file not found')
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

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }
}

import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { env } from '../config/env'

export const LOG_DIR = path.resolve(process.cwd(), 'storage/logs')

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

class DailyRotateStream {
  private currentStream: fs.WriteStream | null = null
  private currentDate: string = ''

  constructor(private logDir: string) {
    this.rotate()
  }

  write(data: string) {
    const now = dayjs().format('YYYY-MM-DD')
    if (now !== this.currentDate) {
      this.rotate()
    }
    this.currentStream?.write(data + '\n')
  }

  private rotate() {
    this.currentDate = dayjs().format('YYYY-MM-DD')
    const filename = `app-${this.currentDate}.log`
    const filePath = path.join(this.logDir, filename)

    if (this.currentStream) {
      this.currentStream.end()
    }

    this.currentStream = fs.createWriteStream(filePath, { flags: 'a' })
  }
}

const fileStream = new DailyRotateStream(LOG_DIR)

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogData {
  datetime: string
  level: LogLevel
  username: string
  fullName: string
  method: string
  url: string
  ip: string
  event: string
  [key: string]: unknown
}

function buildDevSuffix(data: Omit<LogData, 'level' | 'datetime'>): string {
  const parts: string[] = []
  if (data.errorCode) parts.push(`code=${data.errorCode}`)
  if (data.statusCode) parts.push(`status=${data.statusCode}`)
  if (data.name) parts.push(`name=${data.name}`)
  return parts.length ? ` | ${parts.join(' ')}` : ''
}

function writeLog(level: LogLevel, data: Omit<LogData, 'level' | 'datetime'>): void {
  const entry = {
    datetime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    level,
    ...data,
  } as LogData

  fileStream.write(JSON.stringify(entry))

  // Console output in development
  if (env.NODE_ENV === 'development') {
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m'
    console.log(`${color}[${level.toUpperCase()}]\x1b[0m ${entry.method} ${entry.url} - ${entry.username} - ${data.event}${buildDevSuffix(data)}`)
  }
}

export const logger = {
  info: (data: Omit<LogData, 'level' | 'datetime'>) => writeLog('info', data),
  warn: (data: Omit<LogData, 'level' | 'datetime'>) => writeLog('warn', data),
  error: (data: Omit<LogData, 'level' | 'datetime'>) => writeLog('error', data),
}

export interface SystemLogData {
  event: string
  [key: string]: unknown
}

function writeSystemLog(level: LogLevel, data: SystemLogData): void {
  const entry: LogData = {
    datetime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    level,
    username: 'system',
    fullName: 'System',
    method: '-',
    url: '-',
    ip: '-',
    ...data,
  }

  fileStream.write(JSON.stringify(entry))

  if (env.NODE_ENV === 'development') {
    const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m'
    console.log(`${color}[${level.toUpperCase()}]\x1b[0m [SYSTEM] ${data.event}`)
  }
}

export const logSystem = {
  info: (data: SystemLogData) => writeSystemLog('info', data),
  warn: (data: SystemLogData) => writeSystemLog('warn', data),
  error: (data: SystemLogData) => writeSystemLog('error', data),
}

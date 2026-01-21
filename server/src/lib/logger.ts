import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { env } from '../config/env'

export const LOG_DIR = path.resolve(process.cwd(), 'storage/logs')

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function getLogFilePath(): string {
  const date = new Date().toISOString().split('T')[0]
  return path.join(LOG_DIR, `app-${date}.log`)
}

function createStreams(): pino.StreamEntry[] {
  const streams: pino.StreamEntry[] = [
    {
      level: 'info',
      stream: pino.destination({
        dest: getLogFilePath(),
        sync: false
      })
    }
  ]

  if (env.NODE_ENV === 'development') {
    streams.push({
      level: 'debug',
      stream: process.stdout
    })
  }

  return streams
}

export const logger = pino(
  {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label })
    }
  },
  pino.multistream(createStreams())
)

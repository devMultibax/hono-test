import pino from 'pino'
import fs from 'fs'
import path from 'path'
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

  write(string: string) {
    const now = new Date().toISOString().split('T')[0]
    if (now !== this.currentDate) {
      this.rotate()
    }
    this.currentStream?.write(string)
  }

  private rotate() {
    this.currentDate = new Date().toISOString().split('T')[0]
    const filename = `app-${this.currentDate}.log`
    const filePath = path.join(this.logDir, filename)

    if (this.currentStream) {
      this.currentStream.end()
    }

    this.currentStream = fs.createWriteStream(filePath, { flags: 'a' })
  }
}

function createStreams(): pino.StreamEntry[] {
  const streams: pino.StreamEntry[] = [
    {
      level: 'info',
      stream: new DailyRotateStream(LOG_DIR)
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

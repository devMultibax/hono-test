import { z } from 'zod'

const LOG_LEVELS = ['info', 'warn', 'error', 'debug'] as const

export const logQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  level: z.enum(LOG_LEVELS).optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100)
})

export const logEntrySchema = z
  .object({
    level: z.string(),
    time: z.string(),
    msg: z.string(),
    pid: z.number().optional(),
    hostname: z.string().optional()
  })
  .passthrough()

export const logFileSchema = z.object({
  filename: z.string(),
  date: z.string(),
  size: z.number().int().nonnegative(),
  sizeFormatted: z.string()
})

export type LogQuery = z.infer<typeof logQuerySchema>
export type LogEntry = z.infer<typeof logEntrySchema>
export type LogFile = z.infer<typeof logFileSchema>

import { z } from 'zod'

const LOG_LEVELS = ['info', 'warn', 'error'] as const

export const logQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  level: z.enum(LOG_LEVELS).optional(),
  limit: z.coerce.number().int().min(1).max(10000).default(10000)
})

export const logEntrySchema = z
  .object({
    datetime: z.string(),
    level: z.string(),
    username: z.string(),
    fullName: z.string(),
    method: z.string(),
    url: z.string(),
    event: z.string(),
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

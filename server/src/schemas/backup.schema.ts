import { z } from 'zod'

export const backupFileSchema = z.object({
  filename: z.string(),
  date: z.string(),
  size: z.number().int().nonnegative(),
  sizeFormatted: z.string()
})

export const createBackupSchema = z.object({
  prefix: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, 'Prefix can only contain letters, numbers, hyphens, and underscores')
    .max(50)
    .optional()
})

export type BackupFile = z.infer<typeof backupFileSchema>
export type CreateBackupInput = z.infer<typeof createBackupSchema>

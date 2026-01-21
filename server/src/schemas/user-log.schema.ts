import { z } from 'zod'

const ACTION_TYPES = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'] as const

export const userLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['actionAt', 'username', 'actionType']).default('actionAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  username: z.string().optional(),
  actionType: z.enum(ACTION_TYPES).optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .optional()
})

export const userLogIdSchema = z.object({
  id: z.coerce.number().int().positive()
})

export type UserLogQuery = z.infer<typeof userLogQuerySchema>

import { z } from 'zod'
import { paginationQuerySchema } from '../utils/pagination.utils'

export const createDepartmentSchema = z.object({
  name: z.string({ message: 'Name is required' })
    .min(1, { message: 'Name cannot be empty' })
    .max(100, { message: 'Name is too long' })
})

export const updateDepartmentSchema = z.object({
  name: z.string({ message: 'Name is required' })
    .min(1, { message: 'Name cannot be empty' })
    .max(100, { message: 'Name is too long' })
    .optional(),
  status: z.enum(['active', 'inactive'], { message: 'Invalid status' }).optional()
})

export const listDepartmentsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

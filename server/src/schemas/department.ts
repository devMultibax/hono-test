import { z } from 'zod'
import { paginationQuerySchema } from '../utils/pagination.utils'
import { MSG } from '../constants/messages'

export const createDepartmentSchema = z.object({
  name: z.string({ message: MSG.validation.departmentName.required })
    .min(1, { message: MSG.validation.departmentName.required })
    .max(100, { message: MSG.validation.departmentName.maxLength })
})

export const updateDepartmentSchema = z.object({
  name: z.string({ message: MSG.validation.departmentName.required })
    .min(1, { message: MSG.validation.departmentName.required })
    .max(100, { message: MSG.validation.departmentName.maxLength })
    .optional(),
  status: z.enum(['active', 'inactive'], { message: MSG.validation.status.invalid }).optional()
})

export const listDepartmentsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

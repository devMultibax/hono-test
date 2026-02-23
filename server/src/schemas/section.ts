import { z } from 'zod'
import { paginationQuerySchema } from '../utils/pagination.utils'
import { MSG } from '../constants/messages'

export const createSectionSchema = z.object({
  departmentId: z.number({ message: MSG.validation.departmentId.required })
    .int({ message: MSG.validation.departmentId.int })
    .positive({ message: MSG.validation.departmentId.positive }),
  name: z.string({ message: MSG.validation.sectionName.required })
    .min(1, { message: MSG.validation.sectionName.required })
    .max(100, { message: MSG.validation.sectionName.maxLength })
})

export const updateSectionSchema = z.object({
  departmentId: z.number({ message: MSG.validation.departmentId.typeError })
    .int({ message: MSG.validation.departmentId.int })
    .positive({ message: MSG.validation.departmentId.positive })
    .optional(),
  name: z.string({ message: MSG.validation.sectionName.textType })
    .min(1, { message: MSG.validation.sectionName.required })
    .max(100, { message: MSG.validation.sectionName.maxLength })
    .optional(),
  status: z.enum(['active', 'inactive'], { message: MSG.validation.status.invalid }).optional()
})

export const listSectionsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

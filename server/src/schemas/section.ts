import { z } from 'zod'
import { paginationQuerySchema } from '../utils/pagination.utils'

export const createSectionSchema = z.object({
  departmentId: z.number({ message: 'กรุณาระบุรหัสฝ่าย' })
    .int({ message: 'รหัสฝ่ายต้องเป็นจำนวนเต็ม' })
    .positive({ message: 'รหัสฝ่ายต้องเป็นค่าบวก' }),
  name: z.string({ message: 'กรุณาระบุชื่อแผนก' })
    .min(1, { message: 'กรุณาระบุชื่อแผนก' })
    .max(100, { message: 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร' })
})

export const updateSectionSchema = z.object({
  departmentId: z.number({ message: 'รหัสฝ่ายต้องเป็นตัวเลข' })
    .int({ message: 'รหัสฝ่ายต้องเป็นจำนวนเต็ม' })
    .positive({ message: 'รหัสฝ่ายต้องเป็นค่าบวก' })
    .optional(),
  name: z.string({ message: 'ชื่อแผนกต้องเป็นข้อความ' })
    .min(1, { message: 'กรุณาระบุชื่อแผนก' })
    .max(100, { message: 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร' })
    .optional(),
  status: z.enum(['active', 'inactive'], { message: 'สถานะไม่ถูกต้อง' }).optional()
})

export const listSectionsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

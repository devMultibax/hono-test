import { z } from 'zod'
import { paginationQuerySchema } from '../utils/pagination.utils'

export const createDepartmentSchema = z.object({
  name: z.string({ message: 'กรุณาระบุชื่อฝ่าย' })
    .min(1, { message: 'กรุณาระบุชื่อฝ่าย' })
    .max(100, { message: 'ชื่อฝ่ายต้องไม่เกิน 100 ตัวอักษร' })
})

export const updateDepartmentSchema = z.object({
  name: z.string({ message: 'กรุณาระบุชื่อฝ่าย' })
    .min(1, { message: 'กรุณาระบุชื่อฝ่าย' })
    .max(100, { message: 'ชื่อฝ่ายต้องไม่เกิน 100 ตัวอักษร' })
    .optional(),
  status: z.enum(['active', 'inactive'], { message: 'สถานะไม่ถูกต้อง' }).optional()
})

export const listDepartmentsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

import { z } from 'zod'
import { Role } from '../types'
import { paginationQuerySchema } from '../utils/pagination.utils'

export const registerSchema = z.object({
  username: z.string({ message: 'กรุณาระบุรหัสพนักงาน' })
    .length(6, { message: 'รหัสพนักงานต้องมี 6 หลักพอดี' })
    .regex(/^\d{6}$/, { message: 'รหัสพนักงานต้องเป็นตัวเลข 6 หลัก' }),
  firstName: z.string({ message: 'กรุณาระบุชื่อ' })
    .min(1, { message: 'กรุณาระบุชื่อ' })
    .max(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' }),
  lastName: z.string({ message: 'กรุณาระบุนามสกุล' })
    .min(1, { message: 'กรุณาระบุนามสกุล' })
    .max(100, { message: 'นามสกุลต้องไม่เกิน 100 ตัวอักษร' }),
  departmentId: z.number({ message: 'กรุณาระบุรหัสฝ่าย' })
    .int({ message: 'รหัสฝ่ายต้องเป็นจำนวนเต็ม' })
    .positive({ message: 'รหัสฝ่ายต้องเป็นจำนวนบวก' }),
  sectionId: z.number({ message: 'รหัสแผนกต้องเป็นตัวเลข' })
    .int({ message: 'รหัสแผนกต้องเป็นจำนวนเต็ม' })
    .positive({ message: 'รหัสแผนกต้องเป็นจำนวนบวก' })
    .optional()
    .nullable(),
  email: z.string()
    .email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    .max(255, { message: 'อีเมลต้องไม่เกิน 255 ตัวอักษร' })
    .optional()
    .nullable(),
  tel: z.string()
    .length(10, { message: 'เบอร์โทรต้องมี 10 หลักพอดี' })
    .regex(/^[0-9]+$/, { message: 'เบอร์โทรต้องเป็นตัวเลขเท่านั้น' })
    .optional()
    .nullable(),
  role: z.enum(['USER', 'ADMIN'] as const, { message: 'สิทธิ์ไม่ถูกต้อง' }).transform(val => val as Role).optional()
})

export const loginSchema = z.object({
  username: z.string({ message: 'กรุณาระบุรหัสพนักงาน' })
    .length(6, { message: 'รหัสพนักงานต้องมี 6 หลักพอดี' })
    .regex(/^\d{6}$/, { message: 'รหัสพนักงานต้องเป็นตัวเลข 6 หลัก' }),
  password: z.string({ message: 'กรุณาระบุรหัสผ่าน' })
    .min(1, { message: 'กรุณาระบุรหัสผ่าน' })
})

export const updateUserSchema = z.object({
  password: z.string()
    .min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    .max(255, { message: 'รหัสผ่านต้องไม่เกิน 255 ตัวอักษร' })
    .optional(),
  firstName: z.string()
    .min(1, { message: 'กรุณาระบุชื่อ' })
    .max(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' })
    .optional(),
  lastName: z.string()
    .min(1, { message: 'กรุณาระบุนามสกุล' })
    .max(100, { message: 'นามสกุลต้องไม่เกิน 100 ตัวอักษร' })
    .optional(),
  departmentId: z.number()
    .int({ message: 'รหัสฝ่ายต้องเป็นจำนวนเต็ม' })
    .positive({ message: 'รหัสฝ่ายต้องเป็นจำนวนบวก' })
    .optional(),
  sectionId: z.number()
    .int({ message: 'รหัสแผนกต้องเป็นจำนวนเต็ม' })
    .positive({ message: 'รหัสแผนกต้องเป็นจำนวนบวก' })
    .optional()
    .nullable(),
  email: z.string()
    .email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
    .max(255, { message: 'อีเมลต้องไม่เกิน 255 ตัวอักษร' })
    .optional()
    .nullable(),
  tel: z.string()
    .length(10, { message: 'เบอร์โทรต้องมี 10 หลักพอดี' })
    .regex(/^[0-9]+$/, { message: 'เบอร์โทรต้องเป็นตัวเลขเท่านั้น' })
    .optional()
    .nullable(),
  role: z.enum(['USER', 'ADMIN'] as const, { message: 'สิทธิ์ไม่ถูกต้อง' }).transform(val => val as Role).optional(),
  status: z.enum(['active', 'inactive'], { message: 'สถานะไม่ถูกต้อง' }).optional()
})

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  departmentId: z.coerce.number().int().positive().optional(),
  sectionId: z.coerce.number().int().positive().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// Password Management Schemas
export const verifyPasswordSchema = z.object({
  password: z.string({ message: 'กรุณาระบุรหัสผ่าน' })
    .min(1, { message: 'กรุณาระบุรหัสผ่าน' })
})

export const resetPasswordSchema = z.object({
  newPassword: z.string({ message: 'กรุณาระบุรหัสผ่านใหม่' })
    .min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    .max(255, { message: 'รหัสผ่านต้องไม่เกิน 255 ตัวอักษร' })
})

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: 'กรุณาระบุรหัสผ่านปัจจุบัน' })
    .min(1, { message: 'กรุณาระบุรหัสผ่านปัจจุบัน' }),
  newPassword: z.string({ message: 'กรุณาระบุรหัสผ่านใหม่' })
    .min(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
    .max(255, { message: 'รหัสผ่านต้องไม่เกิน 255 ตัวอักษร' })
})

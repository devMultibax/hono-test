import { z } from 'zod'
import { Role } from '../types'
import { paginationQuerySchema } from '../utils/pagination.utils'
import { MSG } from '../constants/messages'

export const registerSchema = z.object({
  username: z.string({ message: MSG.validation.username.required })
    .length(6, { message: MSG.validation.username.length })
    .regex(/^\d{6}$/, { message: MSG.validation.username.format }),
  firstName: z.string({ message: MSG.validation.firstName.required })
    .min(1, { message: MSG.validation.firstName.required })
    .max(100, { message: MSG.validation.firstName.maxLength }),
  lastName: z.string({ message: MSG.validation.lastName.required })
    .min(1, { message: MSG.validation.lastName.required })
    .max(100, { message: MSG.validation.lastName.maxLength }),
  departmentId: z.number({ message: MSG.validation.departmentId.required })
    .int({ message: MSG.validation.departmentId.int })
    .positive({ message: MSG.validation.departmentId.positive }),
  sectionId: z.number({ message: MSG.validation.sectionId.typeError })
    .int({ message: MSG.validation.sectionId.int })
    .positive({ message: MSG.validation.sectionId.positive })
    .optional()
    .nullable(),
  email: z.string()
    .email({ message: MSG.validation.email.format })
    .max(255, { message: MSG.validation.email.maxLength })
    .optional()
    .nullable(),
  tel: z.string()
    .length(10, { message: MSG.validation.tel.length })
    .regex(/^[0-9]+$/, { message: MSG.validation.tel.format })
    .optional()
    .nullable(),
  role: z.enum(['USER', 'ADMIN'] as const, { message: MSG.validation.role.invalid }).transform(val => val as Role).optional()
})

export const loginSchema = z.object({
  username: z.string({ message: MSG.validation.username.required })
    .length(6, { message: MSG.validation.username.length })
    .regex(/^\d{6}$/, { message: MSG.validation.username.format }),
  password: z.string({ message: MSG.validation.password.required })
    .min(1, { message: MSG.validation.password.required })
})

export const updateUserSchema = z.object({
  password: z.string()
    .min(6, { message: MSG.validation.password.minLength })
    .max(255, { message: MSG.validation.password.maxLength })
    .optional(),
  firstName: z.string()
    .min(1, { message: MSG.validation.firstName.required })
    .max(100, { message: MSG.validation.firstName.maxLength })
    .optional(),
  lastName: z.string()
    .min(1, { message: MSG.validation.lastName.required })
    .max(100, { message: MSG.validation.lastName.maxLength })
    .optional(),
  departmentId: z.number()
    .int({ message: MSG.validation.departmentId.int })
    .positive({ message: MSG.validation.departmentId.positive })
    .optional(),
  sectionId: z.number()
    .int({ message: MSG.validation.sectionId.int })
    .positive({ message: MSG.validation.sectionId.positive })
    .optional()
    .nullable(),
  email: z.string()
    .email({ message: MSG.validation.email.format })
    .max(255, { message: MSG.validation.email.maxLength })
    .optional()
    .nullable(),
  tel: z.string()
    .length(10, { message: MSG.validation.tel.length })
    .regex(/^[0-9]+$/, { message: MSG.validation.tel.format })
    .optional()
    .nullable(),
  role: z.enum(['USER', 'ADMIN'] as const, { message: MSG.validation.role.invalid }).transform(val => val as Role).optional(),
  status: z.enum(['active', 'inactive'], { message: MSG.validation.status.invalid }).optional()
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
  password: z.string({ message: MSG.validation.password.required })
    .min(1, { message: MSG.validation.password.required })
})

export const resetPasswordSchema = z.object({
  newPassword: z.string({ message: MSG.validation.password.newRequired })
    .min(6, { message: MSG.validation.password.minLength })
    .max(255, { message: MSG.validation.password.maxLength })
})

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: MSG.validation.password.currentRequired })
    .min(1, { message: MSG.validation.password.currentRequired }),
  newPassword: z.string({ message: MSG.validation.password.newRequired })
    .min(6, { message: MSG.validation.password.minLength })
    .max(255, { message: MSG.validation.password.maxLength })
})

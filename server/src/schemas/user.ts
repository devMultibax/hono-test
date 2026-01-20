import { z } from 'zod'
import { Role } from '../types'
import { paginationQuerySchema } from '../utils/pagination.utils'

export const registerSchema = z.object({
  username: z.string({ message: 'Username is required' })
    .length(6, { message: 'Username must be exactly 6 characters' })
    .regex(/^[a-zA-Z0-9]+$/, { message: 'Username must contain only letters and numbers' }),
  password: z.string({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(255, { message: 'Password is too long' }),
  firstName: z.string({ message: 'First name is required' })
    .min(1, { message: 'First name cannot be empty' })
    .max(100, { message: 'First name is too long' }),
  lastName: z.string({ message: 'Last name is required' })
    .min(1, { message: 'Last name cannot be empty' })
    .max(100, { message: 'Last name is too long' }),
  departmentId: z.number({ message: 'Department ID is required' })
    .int({ message: 'Department ID must be an integer' })
    .positive({ message: 'Department ID must be positive' }),
  sectionId: z.number({ message: 'Section ID must be a number' })
    .int({ message: 'Section ID must be an integer' })
    .positive({ message: 'Section ID must be positive' })
    .optional()
    .nullable(),
  email: z.string()
    .email({ message: 'Invalid email format' })
    .max(255, { message: 'Email is too long' })
    .optional()
    .nullable(),
  tel: z.string()
    .length(10, { message: 'Phone number must be exactly 10 digits' })
    .regex(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
    .optional()
    .nullable(),
  role: z.enum(['USER', 'ADMIN'] as const, { message: 'Invalid role' }).transform(val => val as Role).optional()
})

export const loginSchema = z.object({
  username: z.string({ message: 'Username is required' })
    .length(6, { message: 'Username must be exactly 6 characters' }),
  password: z.string({ message: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' })
})

export const updateUserSchema = z.object({
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(255, { message: 'Password is too long' })
    .optional(),
  firstName: z.string()
    .min(1, { message: 'First name cannot be empty' })
    .max(100, { message: 'First name is too long' })
    .optional(),
  lastName: z.string()
    .min(1, { message: 'Last name cannot be empty' })
    .max(100, { message: 'Last name is too long' })
    .optional(),
  departmentId: z.number()
    .int({ message: 'Department ID must be an integer' })
    .positive({ message: 'Department ID must be positive' })
    .optional(),
  sectionId: z.number()
    .int({ message: 'Section ID must be an integer' })
    .positive({ message: 'Section ID must be positive' })
    .optional()
    .nullable(),
  email: z.string()
    .email({ message: 'Invalid email format' })
    .max(255, { message: 'Email is too long' })
    .optional()
    .nullable(),
  tel: z.string()
    .length(10, { message: 'Phone number must be exactly 10 digits' })
    .regex(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
    .optional()
    .nullable(),
  role: z.enum(['USER', 'ADMIN'] as const, { message: 'Invalid role' }).transform(val => val as Role).optional(),
  status: z.enum(['active', 'inactive'], { message: 'Invalid status' }).optional()
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
  password: z.string({ message: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' })
})

export const resetPasswordSchema = z.object({
  newPassword: z.string({ message: 'New password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(255, { message: 'Password is too long' })
})

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: 'Current password is required' })
    .min(1, { message: 'Current password cannot be empty' }),
  newPassword: z.string({ message: 'New password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(255, { message: 'Password is too long' })
})
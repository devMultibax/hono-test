import { z } from 'zod'

export const createSectionSchema = z.object({
  departmentId: z.number({ message: 'Department ID is required' })
    .int({ message: 'Department ID must be an integer' })
    .positive({ message: 'Department ID must be positive' }),
  name: z.string({ message: 'Name is required' })
    .min(1, { message: 'Name cannot be empty' })
    .max(100, { message: 'Name is too long' })
})

export const updateSectionSchema = z.object({
  departmentId: z.number({ message: 'Department ID must be a number' })
    .int({ message: 'Department ID must be an integer' })
    .positive({ message: 'Department ID must be positive' })
    .optional(),
  name: z.string({ message: 'Name must be a string' })
    .min(1, { message: 'Name cannot be empty' })
    .max(100, { message: 'Name is too long' })
    .optional(),
  status: z.enum(['active', 'inactive'], { message: 'Invalid status' }).optional()
})

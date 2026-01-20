import { z } from 'zod'

export const updateProfileSchema = z.object({
    firstName: z.string()
        .min(1, { message: 'First name cannot be empty' })
        .max(100, { message: 'First name is too long' })
        .optional(),
    lastName: z.string()
        .min(1, { message: 'Last name cannot be empty' })
        .max(100, { message: 'Last name is too long' })
        .optional(),
    email: z.string()
        .email({ message: 'Invalid email format' })
        .max(255, { message: 'Email is too long' })
        .optional()
        .nullable(),
    tel: z.string()
        .length(10, { message: 'Phone number must be exactly 10 digits' })
        .regex(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
        .optional()
        .nullable()
})

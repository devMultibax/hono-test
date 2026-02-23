import { z } from 'zod'
import { MSG } from '../constants/messages'

export const updateProfileSchema = z.object({
    firstName: z.string()
        .min(1, { message: MSG.validation.firstName.required })
        .max(100, { message: MSG.validation.firstName.maxLength })
        .optional(),
    lastName: z.string()
        .min(1, { message: MSG.validation.lastName.required })
        .max(100, { message: MSG.validation.lastName.maxLength })
        .optional(),
    email: z.string()
        .email({ message: MSG.validation.email.format })
        .max(255, { message: MSG.validation.email.maxLength })
        .optional()
        .nullable(),
    tel: z.string()
        .length(10, { message: MSG.validation.tel.length })
        .regex(/^[0-9]+$/, { message: MSG.validation.tel.format })
        .optional()
        .nullable()
})

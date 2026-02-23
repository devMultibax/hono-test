import { z } from 'zod'

export const updateProfileSchema = z.object({
    firstName: z.string()
        .min(1, { message: 'กรุณาระบุชื่อ' })
        .max(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' })
        .optional(),
    lastName: z.string()
        .min(1, { message: 'กรุณาระบุนามสกุล' })
        .max(100, { message: 'นามสกุลต้องไม่เกิน 100 ตัวอักษร' })
        .optional(),
    email: z.string()
        .email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
        .max(255, { message: 'อีเมลต้องไม่เกิน 255 ตัวอักษร' })
        .optional()
        .nullable(),
    tel: z.string()
        .length(10, { message: 'เบอร์โทรศัพท์ต้องมี 10 หลักพอดี' })
        .regex(/^[0-9]+$/, { message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น' })
        .optional()
        .nullable()
})

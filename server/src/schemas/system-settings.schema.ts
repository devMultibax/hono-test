import { z } from 'zod'

export const updateSystemSettingSchema = z.object({
  value: z.string().min(1, 'กรุณาระบุค่า'),
})

export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>

import { z } from 'zod'
import { MSG } from '../constants/messages'

export const updateSystemSettingSchema = z.object({
  value: z.string().min(1, MSG.validation.systemSetting.valueRequired),
})

export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingSchema>

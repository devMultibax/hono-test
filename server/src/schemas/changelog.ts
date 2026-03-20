import { z } from 'zod'
import { paginationQuerySchema } from '../utils/pagination.utils'
import { MSG } from '../constants/messages'

const updateTypeEnum = z.enum(['FEATURE', 'BUGFIX', 'IMPROVEMENT', 'SECURITY', 'OTHER'], {
  message: MSG.validation.changelog.updateTypeInvalid,
})

export const createChangelogSchema = z.object({
  title: z.string({ message: MSG.validation.changelog.titleRequired })
    .min(1, { message: MSG.validation.changelog.titleRequired })
    .max(200, { message: MSG.validation.changelog.titleMaxLength }),
  description: z.string().optional(),
  updateType: updateTypeEnum,
  gitRef: z.string().max(100).optional(),
  updatedDate: z.string({ message: MSG.validation.changelog.updatedDateRequired })
    .min(1, { message: MSG.validation.changelog.updatedDateRequired }),
})

export const updateChangelogSchema = z.object({
  title: z.string({ message: MSG.validation.changelog.titleRequired })
    .min(1, { message: MSG.validation.changelog.titleRequired })
    .max(200, { message: MSG.validation.changelog.titleMaxLength })
    .optional(),
  description: z.string().nullable().optional(),
  updateType: updateTypeEnum.optional(),
  gitRef: z.string().max(100).nullable().optional(),
  updatedDate: z.string().optional(),
})

export const listChangelogsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  updateType: updateTypeEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

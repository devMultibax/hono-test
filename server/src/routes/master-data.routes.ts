import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { MasterDataService } from '../services/master-data.service'
import { sectionSearchSchema } from '../schemas/master-data.schema'
import { authMiddleware } from '../middleware/auth'
import { successResponse } from '../lib/response'
import { ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import { MSG } from '../constants/messages'
import type { HonoContext } from '../types'

const masterDataRoutes = new Hono<HonoContext>()

masterDataRoutes.use('*', authMiddleware)

masterDataRoutes.get('/departments', async (c) => {
    const departments = await MasterDataService.getAllDepartments()
    return successResponse(c, departments)
})

masterDataRoutes.get('/departments/:id/sections', async (c) => {
    const departmentId = parseInt(c.req.param('id'))

    if (isNaN(departmentId)) {
        throw new ValidationError(CODES.MASTER_DATA_INVALID_DEPARTMENT_ID, MSG.errors.masterData.invalidDepartmentId)
    }

    const sections = await MasterDataService.getSectionsByDepartment(departmentId)
    return successResponse(c, sections)
})

masterDataRoutes.post(
    '/departments/sections/search',
    zValidator('json', sectionSearchSchema),
    async (c) => {
        const searchData = c.req.valid('json')
        const sections = await MasterDataService.searchSections(searchData)
        return successResponse(c, sections)
    }
)

masterDataRoutes.get('/users', async (c) => {
    const users = await MasterDataService.getAllUsers()
    return successResponse(c, users)
})

masterDataRoutes.get('/users/from-logs', async (c) => {
    const users = await MasterDataService.getUsersFromLogs()
    return successResponse(c, users)
})

export default masterDataRoutes

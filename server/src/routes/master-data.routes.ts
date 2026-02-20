import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { MasterDataService } from '../services/master-data.service';
import { sectionSearchSchema } from '../schemas/master-data.schema';
import { authMiddleware } from '../middleware/auth';
import { successResponse } from '../lib/response';
import { ValidationError } from '../lib/errors';
import { CODES } from '../constants/error-codes';
import type { HonoContext } from '../types';

const masterDataRoutes = new Hono<HonoContext>();
const masterDataService = new MasterDataService();

// Apply authentication middleware to all routes
masterDataRoutes.use('*', authMiddleware);

// Get all departments
masterDataRoutes.get('/departments', async (c) => {
    const departments = await masterDataService.getAllDepartments();
    return successResponse(c, departments);
});

// Get sections by department ID
masterDataRoutes.get('/departments/:id/sections', async (c) => {
    const departmentId = parseInt(c.req.param('id'));

    if (isNaN(departmentId)) {
        throw new ValidationError(CODES.MASTER_DATA_INVALID_DEPARTMENT_ID);
    }

    const sections = await masterDataService.getSectionsByDepartment(departmentId);
    return successResponse(c, sections);
});

// Search sections
masterDataRoutes.post(
    '/departments/sections/search',
    zValidator('json', sectionSearchSchema),
    async (c) => {
        const searchData = c.req.valid('json');
        const sections = await masterDataService.searchSections(searchData);
        return successResponse(c, sections);
    }
);

// Get all users
masterDataRoutes.get('/users', async (c) => {
    const users = await masterDataService.getAllUsers();
    return successResponse(c, users);
});

// Get users from logs
masterDataRoutes.get('/users/from-logs', async (c) => {
    const users = await masterDataService.getUsersFromLogs();
    return successResponse(c, users);
});

export default masterDataRoutes;

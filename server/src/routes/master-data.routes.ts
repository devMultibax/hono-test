import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { MasterDataService } from '../services/master-data.service';
import { sectionSearchSchema } from '../schemas/master-data.schema';
import { authMiddleware } from '../middleware/auth';
import { CODES } from '../constants/error-codes';
import type { HonoContext } from '../types';

const masterDataRoutes = new Hono<HonoContext>();
const masterDataService = new MasterDataService();

// Apply authentication middleware to all routes
masterDataRoutes.use('*', authMiddleware);

// Get all departments
masterDataRoutes.get('/departments', async (c) => {
    try {
        const departments = await masterDataService.getAllDepartments();

        return c.json({
            success: true,
            data: departments,
        });
    } catch (error) {
        c.get('logError')('Failed to fetch departments', { error: String(error) });
        return c.json(
            {
                success: false,
                error: CODES.MASTER_DATA_FETCH_DEPARTMENTS_FAILED,
            },
            500
        );
    }
});

// Get sections by department ID
masterDataRoutes.get('/departments/:id/sections', async (c) => {
    try {
        const departmentId = parseInt(c.req.param('id'));

        if (isNaN(departmentId)) {
            return c.json(
                {
                    success: false,
                    error: CODES.MASTER_DATA_INVALID_DEPARTMENT_ID,
                },
                400
            );
        }

        const sections = await masterDataService.getSectionsByDepartment(departmentId);

        return c.json({
            success: true,
            data: sections,
        });
    } catch (error) {
        c.get('logError')('Failed to fetch sections', { error: String(error) });
        return c.json(
            {
                success: false,
                error: CODES.MASTER_DATA_FETCH_SECTIONS_FAILED,
            },
            500
        );
    }
});

// Search sections
masterDataRoutes.post(
    '/departments/sections/search',
    zValidator('json', sectionSearchSchema),
    async (c) => {
        try {
            const searchData = c.req.valid('json');
            const sections = await masterDataService.searchSections(searchData);

            return c.json({
                success: true,
                data: sections,
            });
        } catch (error) {
            c.get('logError')('Failed to search sections', { error: String(error) });
            return c.json(
                {
                    success: false,
                    error: CODES.MASTER_DATA_SEARCH_SECTIONS_FAILED,
                },
                500
            );
        }
    }
);

// Get all users
masterDataRoutes.get('/users', async (c) => {
    try {
        const users = await masterDataService.getAllUsers();

        return c.json({
            success: true,
            data: users,
        });
    } catch (error) {
        c.get('logError')('Failed to fetch users', { error: String(error) });
        return c.json(
            {
                success: false,
                error: CODES.MASTER_DATA_FETCH_USERS_FAILED,
            },
            500
        );
    }
});

// Get users from logs
masterDataRoutes.get('/users/from-logs', async (c) => {
    try {
        const users = await masterDataService.getUsersFromLogs();

        return c.json({
            success: true,
            data: users,
        });
    } catch (error) {
        c.get('logError')('Failed to fetch users from logs', { error: String(error) });
        return c.json(
            {
                success: false,
                error: CODES.MASTER_DATA_FETCH_USER_LOGS_FAILED,
            },
            500
        );
    }
});

export default masterDataRoutes;

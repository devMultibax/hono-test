import { z } from 'zod';

// Schema for department list response (simplified)
export const departmentListSchema = z.object({
    id: z.number(),
    name: z.string(),
    status: z.enum(['active', 'inactive']),
});

// Schema for section list response (simplified)
export const sectionListSchema = z.object({
    id: z.number(),
    name: z.string(),
    departmentId: z.number(),
    status: z.enum(['active', 'inactive']),
});

// Schema for user list response (simplified)
export const userListSchema = z.object({
    id: z.number(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().nullable(),
    role: z.enum(['ADMIN', 'USER']),
    departmentId: z.number(),
    sectionId: z.number().nullable(),
    status: z.enum(['active', 'inactive']),
});

// Schema for user from logs response
export const userFromLogsSchema = z.object({
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    department: z.string(),
    section: z.string(),
});

// Schema for section search request
export const sectionSearchSchema = z.object({
    name: z.string().min(1, 'Search term is required'),
    departmentId: z.number().optional(),
});

// Response schemas
export const departmentsResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(departmentListSchema),
});

export const sectionsResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(sectionListSchema),
});

export const usersResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(userListSchema),
});

export const usersFromLogsResponseSchema = z.object({
    success: z.boolean(),
    data: z.array(userFromLogsSchema),
});

// Types
export type DepartmentList = z.infer<typeof departmentListSchema>;
export type SectionList = z.infer<typeof sectionListSchema>;
export type UserList = z.infer<typeof userListSchema>;
export type UserFromLogs = z.infer<typeof userFromLogsSchema>;
export type SectionSearch = z.infer<typeof sectionSearchSchema>;

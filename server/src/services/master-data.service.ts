import { prisma } from '../lib/prisma';
import type { DepartmentList, SectionList, UserList, UserFromLogs, SectionSearch } from '../schemas/master-data.schema';

export class MasterDataService {
    /**
     * Get all departments (simplified for dropdowns)
     */
    async getAllDepartments(): Promise<DepartmentList[]> {
        const departments = await prisma.department.findMany({
            select: {
                id: true,
                name: true,
                status: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return departments;
    }

    /**
     * Get sections by department ID
     */
    async getSectionsByDepartment(departmentId: number): Promise<SectionList[]> {
        const sections = await prisma.section.findMany({
            where: {
                departmentId,
            },
            select: {
                id: true,
                name: true,
                departmentId: true,
                status: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return sections;
    }

    /**
     * Search sections by name and optionally filter by department
     */
    async searchSections(searchData: SectionSearch): Promise<SectionList[]> {
        const { name, departmentId } = searchData;

        const sections = await prisma.section.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
                ...(departmentId && { departmentId }),
            },
            select: {
                id: true,
                name: true,
                departmentId: true,
                status: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return sections;
    }

    /**
     * Get all users (simplified for dropdowns)
     */
    async getAllUsers(): Promise<UserList[]> {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                departmentId: true,
                sectionId: true,
                status: true,
            },
            orderBy: {
                username: 'asc',
            },
        });

        return users;
    }

    /**
     * Get unique users from user logs
     */
    async getUsersFromLogs(): Promise<UserFromLogs[]> {
        const users = await prisma.userLog.findMany({
            distinct: ['username'],
            select: {
                username: true,
                firstName: true,
                lastName: true,
                department: true,
                section: true,
            },
            orderBy: {
                username: 'asc',
            },
        });

        return users;
    }
}

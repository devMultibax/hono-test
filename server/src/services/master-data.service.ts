import { prisma } from '../lib/prisma'
import type { DepartmentList, SectionList, UserList, UserFromLogs, SectionSearch } from '../schemas/master-data.schema'

export class MasterDataService {
    static async getAllDepartments(): Promise<DepartmentList[]> {
        return prisma.department.findMany({
            select: {
                id: true,
                name: true,
                status: true,
            },
            orderBy: { name: 'asc' },
        })
    }

    static async getSectionsByDepartment(departmentId: number): Promise<SectionList[]> {
        return prisma.section.findMany({
            where: { departmentId },
            select: {
                id: true,
                name: true,
                departmentId: true,
                status: true,
            },
            orderBy: { name: 'asc' },
        })
    }

    static async searchSections(searchData: SectionSearch): Promise<SectionList[]> {
        const { name, departmentId } = searchData

        return prisma.section.findMany({
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
            orderBy: { name: 'asc' },
        })
    }

    static async getAllUsers(): Promise<UserList[]> {
        return prisma.user.findMany({
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
            orderBy: { username: 'asc' },
        })
    }

    static async getUsersFromLogs(): Promise<UserFromLogs[]> {
        return prisma.userLog.findMany({
            distinct: ['username'],
            select: {
                username: true,
                firstName: true,
                lastName: true,
                department: true,
                section: true,
            },
            orderBy: { username: 'asc' },
        })
    }
}

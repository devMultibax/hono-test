import { prisma } from '../lib/prisma'
import { ActionType, Role, Status } from '../types'
import type { ActionType as PrismaActionType } from '@prisma/client'

export interface UserLogData {
    username: string
    firstName: string
    lastName: string
    department: { name: string }
    section: { name: string } | null
    email: string | null
    tel: string | null
    role: string
    status: string
    createdAt: Date
    createdBy: string
    createdByName: string
    updatedAt: Date | null
    updatedBy: string | null
    updatedByName: string | null
}

// Optional tx allows calling within a prisma.$transaction block
export async function logUserAction(
    user: UserLogData,
    actionType: ActionType,
    tx?: Pick<typeof prisma, 'userLog'>
): Promise<void> {
    const data = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department.name,
        section: user.section?.name || '',
        email: user.email,
        tel: user.tel,
        role: user.role as Role,
        status: user.status as Status,
        createdAt: user.createdAt,
        createdBy: user.createdBy,
        createdByName: user.createdByName || '',
        updatedAt: user.updatedAt,
        updatedBy: user.updatedBy,
        updatedByName: user.updatedByName,
        actionType: actionType as unknown as PrismaActionType
    }

    const client = tx ?? prisma
    await client.userLog.create({ data })
}

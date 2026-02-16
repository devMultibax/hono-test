import { prisma } from '../lib/prisma'

export async function getUserFullName(username: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { firstName: true, lastName: true }
  })
  return user ? `${user.firstName} ${user.lastName}` : username
}

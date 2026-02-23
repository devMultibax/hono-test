import { vi } from 'vitest'

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  },
  department: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  },
  section: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  },
  userLog: {
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn()
  },
  $transaction: vi.fn(async (callback: (tx: any) => Promise<any>) => callback(mockPrisma)),
  $disconnect: vi.fn()
}

vi.mock('../../src/lib/prisma', () => ({
  prisma: mockPrisma
}))

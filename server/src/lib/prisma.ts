import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../config/env'

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL
})

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const base = new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  })

  /**
   * Prisma Client Extension — auto-populate `updatedAt` on every
   * update/upsert operation so callers don't need to pass
   * `updatedAt: new Date()` manually.
   *
   * Applies to all models that expose an `updatedAt` field
   * (Department, Section, User, SystemSettings, …).
   *
   * Individual services may still pass `updatedAt` explicitly — the explicitly
   * provided value will be used as-is because it is already in `args.data`
   * before this extension runs.
   */
  return base.$extends({
    query: {
      $allModels: {
        async update({ args, query }) {
          if (args.data && typeof args.data === 'object') {
            const data = args.data as Record<string, unknown>
            if (data.updatedAt === undefined) {
              args.data = { ...data, updatedAt: new Date() }
            }
          }
          return query(args)
        },
        async updateMany({ args, query }) {
          if (args.data && typeof args.data === 'object') {
            const data = args.data as Record<string, unknown>
            if (data.updatedAt === undefined) {
              args.data = { ...data, updatedAt: new Date() }
            }
          }
          return query(args)
        },
        async upsert({ args, query }) {
          if (args.update && typeof args.update === 'object') {
            const update = args.update as Record<string, unknown>
            if (update.updatedAt === undefined) {
              args.update = { ...update, updatedAt: new Date() }
            }
          }
          return query(args)
        },
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
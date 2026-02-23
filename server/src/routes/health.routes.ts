import { Hono } from 'hono'
import { prisma } from '../lib/prisma'

const health = new Hono()

health.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

health.get('/db', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    const poolStats = await prisma.$queryRaw<Array<{ active: number; idle: number; total: number }>>`
      SELECT
        COUNT(*) FILTER (WHERE state = 'active') AS active,
        COUNT(*) FILTER (WHERE state = 'idle')   AS idle,
        COUNT(*)                                  AS total
      FROM pg_stat_activity
      WHERE datname = current_database()
    `

    const pool = poolStats[0] ?? { active: 0, idle: 0, total: 0 }

    return c.json({
      status: 'ok',
      database: 'connected',
      pool: {
        active: Number(pool.active),
        idle: Number(pool.idle),
        total: Number(pool.total)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return c.json(
      {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      },
      503
    )
  }
})

export default health

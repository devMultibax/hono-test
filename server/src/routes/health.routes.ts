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
    return c.json({
      status: 'ok',
      database: 'connected',
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

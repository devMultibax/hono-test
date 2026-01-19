import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { env } from './config/env'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/logger'
import { corsMiddleware } from './middleware/cors'
import { generalApiRateLimiter } from './middleware/rate-limit'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import departmentRoutes from './routes/department.routes'
import sectionRoutes from './routes/section.routes'
import healthRoutes from './routes/health.routes'
import { prisma } from './lib/prisma'

const app = new Hono()

// Global middleware
app.use('*', corsMiddleware)
app.use('*', requestLogger)
app.use('*', generalApiRateLimiter)

// Error handler
app.onError(errorHandler)

// Root endpoint
app.get('/', (c) => {
    return c.json({
        message: 'Hono API Server',
        version: '1.0.0',
        status: 'running'
    })
})

// Routes
app.route('/health', healthRoutes)
app.route('/auth', authRoutes)
app.route('/users', userRoutes)
app.route('/departments', departmentRoutes)
app.route('/sections', sectionRoutes)

// 404 handler
app.notFound((c) => {
    return c.json(
        {
            error: 'Not Found',
            message: 'The requested resource was not found'
        },
        404
    )
})

// Graceful shutdown
const shutdown = async () => {
    console.log('\nShutting down gracefully...')
    try {
        await prisma.$disconnect()
        console.log('Database disconnected')
        process.exit(0)
    } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
    }
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Start server
const port = Number(env.PORT)

console.log(`
🚀 Server starting...
📦 Environment: ${env.NODE_ENV}
🌐 Port: ${port}
🔗 URL: http://localhost:${port}
`)

serve({
    fetch: app.fetch,
    port
})

export default app
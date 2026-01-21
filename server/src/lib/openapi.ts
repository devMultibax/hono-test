import type { Hono } from 'hono'
import { Scalar } from '@scalar/hono-api-reference'
import type { ApiReferenceConfiguration } from '@scalar/hono-api-reference'
import { env } from '../config/env'
import { OPENAPI_SCHEMAS } from './openapi-schemas'
import { OPENAPI_PATHS } from './openapi-paths'

/**
 * OpenAPI documentation configuration
 */
const OPENAPI_INFO = {
  openapi: '3.1.0' as const,
  info: {
    title: 'Hono API Documentation',
    version: '1.0.0',
    description: 'RESTful API built with Hono framework for user, department, and section management'
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: 'Development server'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints'
    },
    {
      name: 'Users',
      description: 'User management endpoints (requires authentication)'
    },
    {
      name: 'Departments',
      description: 'Department management endpoints (requires authentication)'
    },
    {
      name: 'Sections',
      description: 'Section management endpoints (requires authentication)'
    },
    {
      name: 'Master Data',
      description: 'Master data lookup endpoints'
    },
    {
      name: 'System Logs',
      description: 'System log management endpoints'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey' as const,
        in: 'cookie' as const,
        name: env.JWT_COOKIE_NAME,
        description: 'JWT token stored in HTTP-only cookie'
      }
    },
    schemas: OPENAPI_SCHEMAS
  },
  paths: OPENAPI_PATHS
}

/**
 * Scalar API Reference configuration
 */
const SCALAR_CONFIG: ApiReferenceConfiguration = {
  theme: 'purple',
  spec: {
    url: '/openapi.json'
  },
  customCss: `
    .scalar-api-client {
      border-radius: 8px;
    }
  `,
  defaultOpenAllTags: false,
  hideModels: false,
  hideDownloadButton: false
}

/**
 * Register OpenAPI documentation routes
 * Only available in development and test environments for security
 * @param app - Hono application instance
 */
export const registerOpenAPIRoutes = (app: Hono) => {
  const isDevelopmentOrTest = env.NODE_ENV === 'development' || env.NODE_ENV === 'test'

  if (isDevelopmentOrTest) {
    // OpenAPI JSON endpoint
    app.get('/openapi.json', (c) => {
      return c.json(OPENAPI_INFO)
    })

    // API documentation UI
    app.get('/docs', Scalar(SCALAR_CONFIG))

    console.log(`📚 API Documentation enabled at /docs (${env.NODE_ENV} mode)`)
  } else {
    // In production, return 404 for documentation endpoints
    app.get('/openapi.json', (c) => {
      return c.json({ error: 'Not Found' }, 404)
    })

    app.get('/docs', (c) => {
      return c.json({ error: 'Not Found' }, 404)
    })

    console.log('🔒 API Documentation disabled (Production mode)')
  }
}

/**
 * Export OpenAPI info for testing or external use
 */
export { OPENAPI_INFO }

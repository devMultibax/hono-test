---
name: add-middleware
description: Generate a new backend middleware following project conventions. Supports global, route-level, and parameterized middleware patterns. Adapts to the project's backend framework.
disable-model-invocation: true
user-invocable: true
argument-hint: [middleware-name] [type: global|route|parameterized]
---

# Add Middleware

Generate middleware: **$0**
Type: **$1** (default: route)

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the backend framework
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review coding conventions
3. Find and read existing middleware files to understand current patterns
4. Read the backend entry point to see the middleware registration order
5. Read the types file for request context type
6. Determine where in the middleware stack this should be inserted

## Abstract Specification

### Type 1: Global Middleware (applied to all routes)

Used for: security headers, CORS, body limit, logging, rate limiting, maintenance mode.

- Receives request context + next function
- Pre-processing before route handler
- Calls next() to continue the chain
- Optional post-processing after route handler
- Registered in entry point on all routes

**Order matters!** Insert at the appropriate position based on purpose:
1. Security/headers (earliest)
2. CORS
3. Body parsing/limits
4. Logging
5. Rate limiting
6. Feature flags / maintenance (latest before routes)

### Type 2: Route-level Middleware (applied per route)

Used for: auth, CSRF, file upload handling.

- Applied to specific route groups or individual routes
- Can access user/session data from context
- Returns error responses directly (doesn't throw)

### Type 3: Parameterized Middleware (factory function)

Used for: role-based permission, configurable rate limiting.

- Returns a middleware function configured with options
- Can export convenience shortcuts (e.g., `requireAdmin = requireRole(Role.ADMIN)`)

## Convention Rules

1. **Error responses** — use the project's response helpers, never raw JSON
2. **Error codes** — use constants, never hardcode strings
3. **Logging** — use the project's logger via request context
4. **Type safety** — type the request context with project's context type
5. **Early return** — return error responses directly, don't throw from middleware
6. **Always call next()** — at the end for successful cases
7. **Export style** — named export, not default export
8. **File naming** — `kebab-case.ts`

## Framework-Specific Guidance

### If Hono

```typescript
import type { Context, Next, MiddlewareHandler } from 'hono'
import type { HonoContext } from '../types'

// Global middleware
export const myMiddleware = async (c: Context, next: Next) => {
  // Pre-processing
  await next()
  // Post-processing (optional)
}

// Route-level middleware
export const myRouteMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const user = c.get('user')
  if (!user) return errorResponse(c, { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' }, 401)
  await next()
}

// Parameterized middleware
export const myFactory = (options: Options): MiddlewareHandler => {
  return async (c: Context<HonoContext>, next: Next) => {
    // Use options
    await next()
  }
}
export const preset = myFactory({ /* config */ })
```

**Registration:**
```typescript
// Global: app.use('*', myMiddleware)
// Route-level: routes.use('/*', myRouteMiddleware)
```

### If Express

```typescript
import type { Request, Response, NextFunction, RequestHandler } from 'express'

// Global middleware
export const myMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Pre-processing
  next()
}

// Route-level middleware
export const myRouteMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: { code: 'AUTH_UNAUTHORIZED' } })
  next()
}

// Parameterized middleware
export const myFactory = (options: Options): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use options
    next()
  }
}
```

**Registration:**
```typescript
// Global: app.use(myMiddleware)
// Route-level: router.use(myRouteMiddleware)
// Per-route: router.get('/path', myRouteMiddleware, handler)
```

### If Fastify

```typescript
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

// Global hook
export const myMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  // Pre-processing — do NOT call next(), Fastify auto-continues
  // To stop: reply.code(401).send({ error: ... })
}

// Parameterized hook
export const myFactory = (options: Options) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Use options
  }
}
```

**Registration:**
```typescript
// Global: fastify.addHook('onRequest', myMiddleware)
// Route-level: { preHandler: myMiddleware }
// Plugin scope: fastify.register(async (instance) => { instance.addHook('onRequest', myMiddleware) })
```

## Common Middleware Patterns

### Request Validation
Validate content type, headers, or other request properties before processing.

### Request Timing
Measure and record request duration. Set response header or log duration.

### IP Whitelist / Blacklist
Check client IP against allowed/blocked list. Return 403 if blocked.

### Context Enrichment
Fetch additional data and attach to request context for downstream handlers.
If adding context variables, update the project's context type definition.

### Feature Flag / Toggle
Check a feature flag (from database, config, or env) and conditionally allow/block the request.

## After Generation

1. Create the middleware file in the middleware directory
2. Add any new error codes to constants
3. Add any new log events to constants
4. Register in the appropriate location:
   - **Global** — entry point at the correct position in the stack
   - **Route-level** — in the relevant route files
5. If middleware adds context variables, update the context type definition
6. Add tests for the new middleware

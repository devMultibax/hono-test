---
name: generate-backend-crud
description: Generate backend CRUD boilerplate (Route/Controller + Service + Validation Schema) for a new resource following the project's layered architecture pattern.
disable-model-invocation: true
user-invocable: true
argument-hint: [resource-name]
---

# Generate Backend CRUD

Generate complete backend CRUD for a new resource: **$ARGUMENTS**

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the project's backend framework, ORM, and validation library
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review shared coding principles
3. Find and read the backend entry point to see how routes are registered
4. Find and read 1 existing resource (simplest CRUD) as reference — its route, service, and schema files
5. Read the error codes / constants files to understand the existing format
6. Read the data model (ORM schema) to confirm the model exists
7. Ask the user what fields the resource has if not provided

## Abstract Specification

Generate **3 files** for the new resource:

### File 1: Validation Schema

- **Create schema** — required business fields only (no status, no audit fields)
- **Update schema** — same fields as create but ALL optional, plus `status` optional
- **List query schema** — extends shared pagination schema, all filter fields optional
- FK IDs in list query use coerced positive integer type
- Reference the project's existing validation message pattern

### File 2: Service

A class/module with static methods:

| Method | Purpose |
|--------|---------|
| `formatResponse` (private) | Transform raw DB record → API response shape |
| `buildWhereClause` (private) | Build query filter from user-provided filters |
| `getAll` | Paginated list with filters (uses shared pagination utility) |
| `getAllSimple` | Unpaginated list for export |
| `getById` | Single record by ID, with optional relation include |
| `create` | Create with duplicate check + audit fields |
| `update` | Update with exists check + duplicate check + audit fields |
| `delete` | Delete with exists check + child record check |

**Rules:**
- Check for duplicate names before create/update
- Check child record counts before delete (if entity has children)
- Populate audit fields (`createdBy`, `createdByName`, `updatedAt`, `updatedBy`, `updatedByName`)
- Use the project's audit utility to resolve username → full name
- Throw custom errors (NotFound, Conflict) with error codes from the constants file

### File 3: Route Handler

- Apply auth middleware + CSRF protection to all routes
- Write operations (POST/PUT/DELETE) require admin permission
- Validate request body/query with the schema from File 1
- Parse and validate route parameter IDs
- Use response helpers for consistent format
- Log all mutations via the project's log event system
- Include export/import endpoints if needed

### Update Supporting Files

- **Error codes** — add `{ENTITY}_NOT_FOUND`, `{ENTITY}_INVALID_ID`, `{ENTITY}_NAME_EXISTS`
- **Log events** — add CREATED, UPDATED, DELETED, IMPORTED entries
- **Validation messages** — add field validation messages
- **Types** — add response interface for the entity
- **Entry point** — register the new route
- **Test mock** — add mock model for the new entity

## Framework-Specific Guidance

### Backend Framework

**If Hono:**
```typescript
const entities = new Hono<HonoContext>()
entities.use('/*', authMiddleware)
entities.use('/*', csrfProtection)
entities.get('/', zValidator('query', listSchema), async (c) => { ... })
entities.post('/', requireAdmin, zValidator('json', createSchema), async (c) => { ... })
// Use c.req.valid('json'), c.req.valid('query'), c.get('user'), c.get('logInfo')
```

**If Express:**
```typescript
const router = Router()
router.use(authMiddleware, csrfProtection)
router.get('/', validate(listSchema), async (req, res) => { ... })
router.post('/', requireAdmin, validate(createSchema), async (req, res) => { ... })
// Use req.body, req.query, req.user, res.json()
```

**If Fastify:**
```typescript
fastify.register(async (instance) => {
  instance.addHook('onRequest', authMiddleware)
  instance.get('/', { schema: listSchema }, async (req, reply) => { ... })
  instance.post('/', { preHandler: requireAdmin, schema: createSchema }, async (req, reply) => { ... })
})
```

### ORM

**If Prisma:**
```typescript
prisma.entity.findMany({ where, ...paginationOptions })
prisma.entity.count({ where })
prisma.entity.findUnique({ where: { id }, include: { ... } })
prisma.entity.create({ data: { ...data, createdBy, createdByName } })
prisma.entity.update({ where: { id }, data: { ...data, updatedAt: new Date(), updatedBy, updatedByName } })
prisma.entity.delete({ where: { id } })
```

**If Drizzle:**
```typescript
db.select().from(entityTable).where(and(...conditions)).limit(limit).offset(offset)
db.select({ count: count() }).from(entityTable).where(and(...conditions))
db.insert(entityTable).values({ ...data, createdBy, createdByName }).returning()
db.update(entityTable).set({ ...data, updatedAt: new Date() }).where(eq(entityTable.id, id)).returning()
db.delete(entityTable).where(eq(entityTable.id, id))
```

**If TypeORM:**
```typescript
repository.findAndCount({ where, skip, take, order })
repository.findOneBy({ id })
repository.save({ ...data, createdBy, createdByName })
repository.update(id, { ...data, updatedAt: new Date(), updatedBy, updatedByName })
repository.delete(id)
```

### Validation

**If Zod:**
```typescript
const createSchema = z.object({ name: z.string().min(1).max(100) })
const updateSchema = z.object({ name: z.string().min(1).optional(), status: z.enum(['active','inactive']).optional() })
const listQuerySchema = paginationSchema.extend({ search: z.string().optional(), status: z.enum(['active','inactive']).optional() })
```

**If Joi:**
```typescript
const createSchema = Joi.object({ name: Joi.string().min(1).max(100).required() })
```

**If class-validator (NestJS):**
```typescript
class CreateDto { @IsString() @MinLength(1) @MaxLength(100) name: string }
```

## Naming Conventions

| Concept | Format | Example |
|---------|--------|---------|
| Schema file | `schemas/{entity}.ts` | `product.ts` |
| Service file | `services/{entity}.service.ts` | `product.service.ts` |
| Route file | `routes/{entity}.routes.ts` | `product.routes.ts` |
| Service class | `{Entity}Service` | `ProductService` |
| Create schema | `create{Entity}Schema` | `createProductSchema` |
| Error codes | `{ENTITY}_NOT_FOUND` | `PRODUCT_NOT_FOUND` |
| Log events | `{ENTITY}_CREATED` | `PRODUCT_CREATED` |
| API path | `/{entities}` | `/products` |

## After Generation Checklist

- [ ] Data model exists (run `/generate-db-model` if not)
- [ ] Error codes added to constants
- [ ] Log events added to constants
- [ ] Validation messages added (if project uses message constants)
- [ ] Types/interfaces added
- [ ] Route registered in entry point
- [ ] Test mock updated (if project uses shared mocks)
- [ ] Export columns added (if export needed)
- [ ] Import validation added (if import needed)

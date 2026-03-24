---
name: generate-tests
description: Generate test files for a resource — unit tests (service), integration tests (routes), and mock data. Adapts to the project's test runner, backend framework, and ORM.
disable-model-invocation: true
user-invocable: true
argument-hint: [resource-name] [type: unit|integration|e2e|all]
---

# Generate Tests

Generate tests for: **$0**
Test type: **$1** (default: all)

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect test runner, backend framework, and ORM
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review testing conventions
3. Find and read existing test files as reference (1 unit test + 1 integration test for simplest resource)
4. Find and read existing mock files (ORM mock, data mock)
5. Read the actual service and route files for the target resource

## Abstract Specification

### 1. Mock Data

Add to the shared mock data file:

- **Basic mock** — raw entity with required fields
- **Response mock** — formatted entity with audit name fields
- **WithRelations mock** — entity with child relations (if applicable)
- **Factory function** — `createMock{Entities}(count)` for generating arrays

### 2. ORM Mock

Add the new entity's model methods to the shared ORM mock file (if not already present).

### 3. Unit Tests (Service)

Test each service method with happy path + error paths:

```
describe('{Entity}Service')
  describe('getAll')
    it('should return all entities with pagination')
    it('should filter by search')
    it('should filter by status')
  describe('getById')
    it('should return entity by id')
    it('should throw NotFoundError when not found')
  describe('create')
    it('should create a new entity')
    it('should throw ConflictError when name already exists')
  describe('update')
    it('should update entity')
    it('should throw NotFoundError when not found')
    it('should throw ConflictError when name already taken')
  describe('delete')
    it('should delete entity')
    it('should throw NotFoundError when not found')
    // Add: should throw ConflictError when has child records (if applicable)
```

**Rules:**
- Mock the ORM/data access layer, not internal logic
- Clear all mocks in `beforeEach`
- Verify mock calls with expected arguments
- Test both return values and thrown errors

### 4. Integration Tests (Routes)

Test HTTP request/response cycle:

```
describe('{Entity} Routes')
  describe('GET /{entities}')
    it('should return all entities')
    it('should return 401 without auth token')
  describe('GET /{entities}/:id')
    it('should return entity by id')
    it('should return 400 for invalid id')
    it('should return 404 when not found')
  describe('POST /{entities}')
    it('should create entity (admin only)')
    it('should return 403 for non-admin')
    it('should return 409 when name exists')
  describe('PUT /{entities}/:id')
    it('should update entity (admin only)')
    it('should return 400 for invalid id')
    it('should return 403 for non-admin')
  describe('DELETE /{entities}/:id')
    it('should delete entity (admin only)')
    it('should return 403 for non-admin')
    it('should return 404 when not found')
```

**Rules:**
- Mock the entire service module (not the ORM)
- Mock auth/csrf/permission middleware
- Test status codes: 200, 201, 204, 400, 401, 403, 404, 409
- Always test admin vs non-admin access for write operations

## Framework-Specific Guidance

### Test Runner

**If Vitest:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
// Mocking: vi.fn(), vi.mock('module'), vi.mocked(fn)
// Clear: vi.clearAllMocks() or fn.mockClear()
```

**If Jest:**
```typescript
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
// Mocking: jest.fn(), jest.mock('module'), jest.mocked(fn)
// Clear: jest.clearAllMocks() or fn.mockClear()
```

### Integration Test Transport

**If Hono:**
```typescript
const app = new Hono()
app.onError(errorHandler)
app.route('/{entities}', entityRoutes)
const res = await app.request('/{entities}', { method: 'GET', headers: { Cookie: 'auth_token=admin' } })
expect(res.status).toBe(200)
const data = await res.json()
```

**If Express:**
```typescript
import supertest from 'supertest'
const request = supertest(app)
const res = await request.get('/{entities}').set('Cookie', 'auth_token=admin')
expect(res.status).toBe(200)
expect(res.body).toHaveProperty('data')
```

**If Fastify:**
```typescript
const res = await app.inject({ method: 'GET', url: '/{entities}', cookies: { auth_token: 'admin' } })
expect(res.statusCode).toBe(200)
const data = JSON.parse(res.payload)
```

### ORM Mock

**If Prisma:**
```typescript
// In shared mock file:
{entity}: {
  findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(),
  create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn()
}
// Usage: mockPrisma.{entity}.findMany.mockResolvedValue(mockItems)
```

**If Drizzle:**
```typescript
// Mock db instance methods:
const mockDb = { select: vi.fn().mockReturnThis(), from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(), values: vi.fn().mockReturnThis(),
  returning: vi.fn() }
```

**If TypeORM:**
```typescript
// Mock repository:
const mockRepository = { find: vi.fn(), findOne: vi.fn(), findAndCount: vi.fn(),
  save: vi.fn(), update: vi.fn(), delete: vi.fn() }
```

## Test File Locations

Follow the project's existing test directory structure. Common patterns:

| Type | Path Pattern |
|------|-------------|
| Unit tests | `tests/unit/services/{entity}.service.test.ts` |
| Integration tests | `tests/integration/routes/{entity}.routes.test.ts` |
| Mock data | `tests/mocks/data.mock.ts` |
| ORM mock | `tests/mocks/{orm}.mock.ts` |

## After Generation Checklist

- [ ] Mock data added for new entity
- [ ] ORM mock updated with new model
- [ ] Unit tests cover all service methods
- [ ] Integration tests cover all route endpoints
- [ ] Admin vs non-admin access tested
- [ ] Error cases tested (not found, conflict, validation)
- [ ] All tests pass: run the project's test command

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo with two packages:
- `app/` — Frontend: React + Vite + TypeScript
- `server/` — Backend: Hono + Prisma + TypeScript + PostgreSQL

## Development Commands

### Frontend (`app/`)
```bash
npm run dev           # Start dev server
npm run build         # TypeScript check + Vite build
npm run lint          # ESLint
npm run test          # Vitest watch mode
npm run test:run      # Single test run
npm run test:coverage # Coverage report
```

### Backend (`server/`)
```bash
npm run dev           # tsx watch (hot reload)
npm run build         # TypeScript compile to dist/
npm run start         # Run compiled output
npm run test          # Run all tests
npm run test:unit     # Unit tests only (tests/unit/)
npm run test:integration  # Integration tests only
npm run test:e2e      # E2E tests only
```

### Database (`server/`)
```bash
npx prisma migrate dev    # Run migrations
npx prisma migrate deploy # Apply migrations in production
npx prisma generate       # Regenerate Prisma client
npm run seed              # Run seed script (server/prisma/seed.ts)
```

## Architecture

### Backend (Hono)

**Entry point:** `server/src/index.ts` — registers middleware stack (security headers → CORS → body limit → logging → rate limit → maintenance), then mounts all routes.

**Pattern:** Route file → Service → Prisma
- Routes in `server/src/routes/` handle HTTP, validation (Zod), and OpenAPI spec
- Services in `server/src/services/` contain business logic
- Schemas in `server/src/schemas/` define Zod validation + OpenAPI types via `@hono/zod-openapi`

**Auth:** JWT stored in HTTP-only cookies. `server/src/middleware/auth.ts` validates tokens. Role-based access (`USER`/`ADMIN`) enforced via `server/src/middleware/permission.ts`.

**API docs:** Available at `/docs` (Scalar UI) in development.

**Environment:** All env vars validated with Zod at startup in `server/src/config/env.ts`. Required: `DATABASE_URL`, `JWT_SECRET` (min 32 chars). Copy `server/.env.example` to `server/.env`.

### Frontend (React)

**Feature-based modules** in `app/src/features/[feature]/`:
- `pages/` — Page components
- `components/` — Feature UI (Form, Drawer, Filter, ActionMenu, etc.)
- `hooks/` — TanStack Query hooks via `createCrudHooks` factory
- `[feature]Table.config.tsx` — TanStack Table column definitions
- `types.ts` — TypeScript interfaces

**State management:**
- Server state: TanStack Query (`app/src/hooks/createCrudHooks.ts` — generic CRUD hook factory)
- Client state: Zustand stores in `app/src/stores/`
- Auth state: React Context in `app/src/contexts/`

**Path alias:** `@` → `app/src/`

### Database (Prisma + PostgreSQL)

Schema at `server/prisma/schema.prisma`. Key models: `User`, `Department`, `Section`, `UserLog`, `SystemSetting`.

All models include audit fields: `createdAt`, `createdBy`, `createdByName`, `updatedAt`, `updatedBy`, `updatedByName`.

### Testing

**Backend tests** use Vitest + supertest. Prisma is mocked in `server/tests/mocks/prisma.mock.ts`. Test helpers in `server/tests/helpers/test.helper.ts`.

**Frontend tests** use Vitest + jsdom + Testing Library + MSW for API mocking. MSW handlers in `app/src/__tests__/mocks/handlers/`.

## Adding a New Feature Module

Follow the Department module as the reference implementation. The `POSITION_MODULE_PLAN.md` in the root documents the pattern for cloning an existing module. Key files to replicate:
- Backend: route file, service file, Zod schema, Prisma model + migration
- Frontend: feature folder with pages, components, hooks, table config, types
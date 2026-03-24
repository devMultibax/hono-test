---
name: setup-project
description: Bootstrap a new fullstack project with a layered architecture monorepo. Asks for tech stack selection (backend, ORM, frontend, UI, test) then generates the full project structure.
disable-model-invocation: true
user-invocable: true
argument-hint: [project-name]
---

# Setup New Project

Bootstrap a new project: **$ARGUMENTS**

## Pre-flight

1. Read `!cat .claude/skills/_foundation/philosophy.md` — this defines the architecture and conventions
2. Ask the user for their tech stack choices (see Step 0)

## Step 0: Stack Selection

Ask the user to choose (or suggest defaults):

| Category | Options | Default |
|----------|---------|---------|
| **Backend** | Hono / Express / Fastify / NestJS | Hono |
| **ORM** | Prisma / Drizzle / TypeORM | Prisma |
| **Database** | PostgreSQL / MySQL / SQLite | PostgreSQL |
| **Validation** | Zod / Joi / class-validator | Zod |
| **Frontend** | React + Vite / Next.js / Vue + Vite / None | React + Vite |
| **UI Library** | Mantine / shadcn/ui / MUI / Ant Design / None | Mantine |
| **Data Fetching** | TanStack Query / SWR / tRPC | TanStack Query |
| **State** | Zustand / Redux Toolkit / Pinia | Zustand |
| **Test Runner** | Vitest / Jest | Vitest |
| **CSS** | Tailwind CSS / CSS Modules / Styled Components | Tailwind CSS |

If the user says "use defaults" or doesn't specify, use the defaults above.

## Project Structure

Generate this directory structure (adapt names to chosen stack):

```
{project}/
├── app/                          # Frontend (skip if "None")
│   ├── src/
│   │   ├── api/                  # HTTP client + service modules
│   │   ├── components/
│   │   │   ├── common/           # Shared components (DataTable, DrawerForm, etc.)
│   │   │   ├── layout/           # MainLayout, Header, Sidebar, ProtectedRoute
│   │   │   └── forms/            # Reusable form selects
│   │   ├── constants/            # Role constants, options
│   │   ├── contexts/             # React contexts
│   │   ├── features/
│   │   │   └── auth/             # Login page + auth hooks
│   │   ├── hooks/                # Shared hooks (CRUD factory, query keys, etc.)
│   │   ├── lib/                  # i18n, date utils
│   │   ├── providers/            # Query, Theme providers
│   │   ├── routes/               # Route definitions
│   │   ├── stores/               # Client state stores
│   │   ├── types/                # Shared TypeScript types
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                       # Backend
│   ├── src/
│   │   ├── config/               # Environment validation
│   │   ├── constants/            # Error codes, log events, messages
│   │   ├── lib/                  # Core libraries (ORM client, logger, errors, response helpers)
│   │   ├── middleware/           # All middleware
│   │   ├── routes/               # Route handlers
│   │   ├── services/             # Business logic
│   │   ├── schemas/              # Validation schemas
│   │   ├── types/                # TypeScript types
│   │   ├── utils/                # Utility functions
│   │   └── index.ts              # Entry point
│   ├── {orm-schema}/             # e.g., prisma/, drizzle/
│   ├── tests/
│   │   ├── mocks/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── CLAUDE.md                     # Project documentation for Claude Code
└── .gitignore
```

## Setup Steps

### Step 1: Initialize

```bash
mkdir {project} && cd {project} && git init
```

### Step 2: Backend

1. Create directory structure
2. Initialize `package.json`
3. Install dependencies based on chosen stack
4. Generate core files:

| File | Purpose |
|------|---------|
| `config/env.ts` | Environment validation (Zod/Joi schema for DATABASE_URL, JWT_SECRET, PORT, etc.) |
| `lib/{orm}.ts` | ORM client singleton |
| `lib/errors.ts` | Custom error classes: AppError, ValidationError, NotFoundError, ConflictError, UnauthorizedError |
| `lib/response.ts` | Response helpers: successResponse, errorResponse, createdResponse, noContentResponse |
| `lib/logger.ts` | Logger configuration (Pino or similar) |
| `lib/password.ts` | Password hashing (bcryptjs) |
| `lib/get-ip.ts` | Client IP extraction |
| `lib/csrf-utils.ts` | CSRF token utilities |
| `constants/error-codes.ts` | Base error codes (AUTH, VALIDATION, GENERIC) |
| `constants/log-events.ts` | Log event templates |
| `constants/messages.ts` | Validation & error messages |
| `types/index.ts` | Core TypeScript interfaces and enums |

5. Generate middleware stack (order matters):

| Order | Middleware | Purpose |
|-------|-----------|---------|
| 1 | Security headers | X-Content-Type-Options, X-Frame-Options, CSP, HSTS |
| 2 | CORS | Origin validation with env-based config |
| 3 | Body limit | Request body size limit |
| 4 | Request logger | HTTP request/response logging |
| 5 | Log context | Inject log functions into request context |
| 6 | Rate limiter | API rate limiting (general, login, strict) |
| 7 | Maintenance | Maintenance mode check |
| 8 | Error handler | Global error handler |
| 9 | Auth | JWT cookie validation (route-level) |
| 10 | Permission | Role-based access: requireAdmin, requireUser (route-level) |
| 11 | CSRF | CSRF protection (route-level) |
| 12 | Upload | File upload handling (route-level) |

6. Generate utilities:

| Utility | Purpose |
|---------|---------|
| `pagination.utils.ts` | calculatePagination, formatPaginationResponse, paginationSchema |
| `id-validator.utils.ts` | parseRouteId, requireRouteId |
| `audit.utils.ts` | getUserFullName |
| `sanitize.utils.ts` | Input sanitization |
| `time.utils.ts` | Time helpers |
| `excel.utils.ts` | Excel generation |
| `file-validator.utils.ts` | File upload validation |

7. Generate auth system:
   - Auth service (login, token generation/verification)
   - Auth routes (`/login`, `/logout`, `/refresh`, `/me`)
   - Health check route (`/health`)

8. Generate entry point with middleware stack and route registration

9. Generate database schema with base models (User, SystemSetting) and enums (Status, Role)

### Step 3: Frontend (if selected)

1. Scaffold with Vite (or framework CLI)
2. Install dependencies based on chosen stack
3. Generate core files:

| File | Purpose |
|------|---------|
| `api/client.ts` | HTTP client with interceptors (auth, error, CSRF) |
| `api/endpoints.ts` | API endpoint constants |
| `api/error-handler.ts` | API error handling |
| `hooks/createCrudHooks.ts` | Generic CRUD mutation factory |
| `hooks/createQueryKeys.ts` | Query key factory |
| `hooks/useDataTable.ts` | Table state management |
| `hooks/useRefresh.ts` | Refresh with min loading time |
| `hooks/useConfirm.tsx` | Confirmation dialog |
| `hooks/useAuth.ts` | Auth state hook |
| `providers/QueryProvider.tsx` | Data fetching client |
| `providers/ThemeProvider.tsx` | UI theme configuration |
| `stores/auth.store.ts` | Auth state store |
| `routes/index.tsx` | Route definitions with guards |
| `components/layout/*` | MainLayout, Header, Sidebar, ProtectedRoute, AdminRoute |
| `components/common/*` | DataTable, DrawerForm, FormOverlay, StatusBadge, etc. |
| `features/auth/` | Login page + auth hooks |
| `lib/i18n/` | Internationalization setup |
| `types/index.ts` | Shared TypeScript types |

### Step 4: Config Files

- `tsconfig.json` (backend + frontend)
- Test runner config (vitest.config.ts or jest.config.ts)
- CSS config (tailwind.config.ts, etc.)
- `.gitignore`
- `.env.example`

### Step 5: Scripts

**Backend `package.json`:**
```json
{
  "scripts": {
    "dev": "{dev-command}",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "{test-runner} run",
    "test:watch": "{test-runner}",
    "test:unit": "{test-runner} run tests/unit/",
    "test:integration": "{test-runner} run tests/integration/",
    "test:coverage": "{test-runner} run --coverage",
    "seed": "{ts-runner} {orm-schema}/seed.ts"
  }
}
```

**Frontend `package.json`:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint .",
    "test": "{test-runner}",
    "test:run": "{test-runner} run",
    "test:coverage": "{test-runner} run --coverage"
  }
}
```

### Step 6: CLAUDE.md

Generate a comprehensive `CLAUDE.md` documenting:
- Project structure
- Development commands
- Architecture (backend pattern, frontend pattern)
- Key files and their purposes
- Database models
- Coding conventions
- Environment setup

## After Setup

1. Copy `.env.example` to `.env` and fill values
2. Run database migration
3. Run seed script
4. Start backend dev server
5. Start frontend dev server
6. Use `/generate-fullstack-crud` to add new features

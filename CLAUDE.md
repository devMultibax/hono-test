# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo with two packages:

- `app/` — Frontend: React + Vite + TypeScript
- `server/` — Backend: Hono + Prisma + TypeScript + PostgreSQL
- `docs/` — Design documents & feature plans (gitignored)

## Development Commands

### Frontend (`app/`)

```bash
npm run dev           # Start dev server
npm run build         # TypeScript check + Vite build
npm run build:analyze # Bundle analysis (visualizer)
npm run lint          # ESLint
npm run test          # Vitest watch mode
npm run test:run      # Single test run
npm run test:coverage # Coverage report
npm run test:ui       # Vitest UI
```

### Backend (`server/`)

```bash
npm run dev           # tsx watch (hot reload)
npm run build         # TypeScript compile to dist/
npm run start         # Run compiled output
npm run test          # Run all tests
npm run test:watch    # Vitest watch mode
npm run test:unit     # Unit tests only (tests/unit/)
npm run test:integration  # Integration tests only
npm run test:e2e      # E2E tests only
npm run test:coverage # Coverage report
npm run test:ui       # Vitest UI
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

**Entry point:** `server/src/index.ts` — registers middleware stack (security headers → CORS → body limit → request logger → log middleware → rate limit → maintenance), then mounts all routes.

**Pattern:** Route file → Service → Prisma

- Routes in `server/src/routes/` handle HTTP, validation (Zod), and OpenAPI spec
- Services in `server/src/services/` contain business logic
- Schemas in `server/src/schemas/` define Zod validation + OpenAPI types via `@hono/zod-openapi`

**Routes registered:**
| Path | Route File | Description |
|---|---|---|
| `/health` | `health.routes.ts` | Health check |
| `/auth` | `auth.routes.ts` | Login/logout/refresh |
| `/users` | `user.routes.ts` | User CRUD + import/export |
| `/departments` | `department.routes.ts` | Department CRUD |
| `/sections` | `section.routes.ts` | Section CRUD |
| `/master-data` | `master-data.routes.ts` | Dropdown/lookup data |
| `/database` | `database.routes.ts` | DB admin operations |
| `/system-log` | `system-log.routes.ts` | System audit logs |
| `/backup` | `backup.routes.ts` | Backup management |
| `/user-logs` | `user-log.routes.ts` | User activity logs |
| `/system-settings` | `system-settings.routes.ts` | System configuration |
| `/changelogs` | `changelog.routes.ts` | Update/changelog entries |

**Middleware stack** (`server/src/middleware/`):

- `security-headers.ts` — Security HTTP headers
- `cors.ts` — CORS configuration
- `csrf.ts` — CSRF protection
- `error-handler.ts` — Global error handler (`app.onError`)
- `logger.ts` — Request logging (Pino)
- `rate-limit.ts` — API rate limiting
- `maintenance.ts` — Maintenance mode check
- `auth.ts` — JWT token validation
- `permission.ts` — Role-based access (`USER`/`ADMIN`)
- `upload.ts` — File upload handling

**Auth:** JWT stored in HTTP-only cookies. `server/src/middleware/auth.ts` validates tokens. Role-based access (`USER`/`ADMIN`) enforced via `server/src/middleware/permission.ts`.

**API docs:** Available at `/docs` (Scalar UI) in development.

**Environment:** All env vars validated with Zod at startup in `server/src/config/env.ts`. Required: `DATABASE_URL`, `JWT_SECRET` (min 32 chars). Copy `server/.env.example` to `server/.env`.

**Utilities** (`server/src/utils/`):

- `pagination.utils.ts` — Standardized pagination
- `sanitize.utils.ts` — Input sanitization
- `audit.utils.ts` — Audit field helpers
- `excel.utils.ts`, `excel-response.utils.ts` — Excel export (ExcelJS)
- `file-validator.utils.ts` — File upload validation
- `upload-handler.utils.ts` — File upload handling
- `id-validator.utils.ts` — ID validation
- `query-parser.utils.ts` — Query string parsing
- `format.utils.ts` — Data formatting
- `user-log.utils.ts` — User log helpers
- `process.utils.ts` — Process utilities
- `time.utils.ts` — Time utilities

**Libraries** (`server/src/lib/`):

- `prisma.ts` — Prisma client instance + connection
- `logger.ts` — Pino logger configuration
- `openapi.ts` — OpenAPI/Swagger setup
- `openapi-paths.ts`, `openapi-schemas.ts` — OpenAPI spec definitions
- `errors.ts` — Custom error classes
- `response.ts` — Standard response helpers
- `export-helpers.ts` — Export utility functions
- `csrf-utils.ts` — CSRF token utilities
- `get-ip.ts` — Client IP extraction
- `password.ts` — Password hashing (bcryptjs)

**Constants** (`server/src/constants/`):

- `messages.ts` — Thai/English response messages
- `error-codes.ts` — Standardized error codes
- `log-events.ts` — Log event definitions

**Scheduled services:**

- `scheduled-backup.service.ts` — Automated backup via node-cron
- `scheduled-log.service.ts` — Automated log cleanup via node-cron

**Key services:**

- `import.service.ts` — User bulk import from Excel (XLSX)
- `export.service.ts` — User/data export to Excel (ExcelJS)
- `template.service.ts` — PDF template generation (PDFKit)
- `changelog.service.ts` — Changelog/update log management

**Types** (`server/src/types/`):

- `index.ts` — Main TypeScript interfaces and enums
- `export.ts` — Export-related types

### Frontend (React)

**Entry point:** `app/src/main.tsx` → `App.tsx` → `RouterProvider`

**Feature-based modules** in `app/src/features/[feature]/`:

- `pages/` — Page components
- `components/` — Feature UI (Form, Drawer, Filter, ActionMenu, etc.)
- `hooks/` — TanStack Query hooks via `createCrudHooks` factory
- `[feature]Table.config.tsx` — TanStack Table column definitions
- `types.ts` — TypeScript interfaces

**Current feature modules:**
| Feature | Path | Description |
|---|---|---|
| `auth` | `features/auth/` | Login page & auth hooks |
| `users` | `features/users/` | User management + user logs |
| `departments` | `features/departments/` | Department CRUD |
| `sections` | `features/sections/` | Section CRUD |
| `dashboard` | `features/dashboard/` | Dashboard page |
| `profile` | `features/profile/` | Profile + force change password |
| `system-settings` | `features/system-settings/` | System settings |
| `systemLogs` | `features/systemLogs/` | System audit logs |
| `backup` | `features/backup/` | Backup management |
| `database` | `features/database/` | Database admin |
| `maintenance` | `features/maintenance/` | Maintenance mode page |
| `changelogs` | `features/changelogs/` | Changelog/update log CRUD |

**State management:**

- Server state: TanStack Query (`app/src/hooks/createCrudHooks.ts` — generic CRUD hook factory)
- Client state: Zustand stores in `app/src/stores/` (currently `auth.store.ts`)
- Context: `app/src/contexts/PageHeaderContext.tsx` — page header state

**Providers** (`app/src/providers/`):

- `QueryProvider.tsx` — TanStack Query client
- `ThemeProvider.tsx` — Mantine theme configuration

**Routing:** React Router v7 (`app/src/routes/`):

- `index.tsx` — Route definitions with `createBrowserRouter`
- `pages.tsx` — Lazy-loaded page components
- Public routes: `/login`, `/maintenance`, `/force-change-password`
- Protected routes: wrapped in `ProtectedRoute` → `MainLayout`
- Admin routes: wrapped in `AdminRoute` under `/admin/*`

**UI components** (`app/src/components/`):

- `common/DataTable/` — Reusable data table (DataTable, TableSkeleton, EmptyState, TablePagination, DataTableToolbar)
- `common/DrawerForm.tsx` — Generic drawer with form
- `common/FormOverlay.tsx` — Form submit overlay
- `common/ImportButton.tsx` — Excel import button
- `common/ExportButton.tsx`, `ExportDrawer.tsx` — Data export
- `common/SearchInput.tsx` — Search input
- `common/PageHeader.tsx` — Page header
- `common/ErrorFallback.tsx` — Error boundary fallback
- `common/StatusBadge.tsx`, `StatusSwitch.tsx` — Status display/toggle
- `common/RoleBadge.tsx` — Role display
- `common/PasswordDisplay.tsx` — Password field display
- `common/InfoField.tsx` — Read-only info display
- `layout/MainLayout.tsx` — App shell (Header + Sidebar + content)
- `layout/Header.tsx` — Top navigation bar
- `layout/Sidebar.tsx` — Side navigation menu
- `layout/sidebarMenu.config.ts` — Menu configuration
- `layout/ProtectedRoute.tsx` — Auth guard
- `layout/AdminRoute.tsx` — Admin role guard
- `forms/DepartmentSelect.tsx`, `SectionSelect.tsx` — Reusable form selects

**API layer** (`app/src/api/`):

- `client.ts` — Axios instance with interceptors
- `endpoints.ts` — API endpoint constants
- `error-handler.ts` — API error handling
- `services/*.api.ts` — Service modules (auth, user, department, section, backup, database, system-settings, systemLog, user-log, changelog)

**Hooks** (`app/src/hooks/`):

- `createCrudHooks.ts` — Generic factory for CRUD TanStack Query hooks
- `createQueryKeys.ts` — Query key factory
- `useAuth.ts` — Auth state hook
- `useConfirm.tsx` — Confirmation dialog hook
- `useDataTable.ts` — DataTable state management
- `usePageMeta.ts` — Page title & meta
- `useRefresh.ts` — Data refresh with min loading time (500ms)
- `useNavigationProgress.ts` — Navigation progress bar

**Key libraries used:**

- UI: Mantine v8 (`@mantine/core`, `@mantine/form`, `@mantine/hooks`, `@mantine/modals`, `@mantine/notifications`, `@mantine/nprogress`, `@mantine/dates`)
- Icons: `@tabler/icons-react`, `lucide-react`
- Data fetching: `@tanstack/react-query`
- Table: `@tanstack/react-table`
- HTTP client: `axios`
- Dates: `dayjs`
- i18n: `i18next` + `react-i18next` (locales in `app/src/lib/i18n/locales/`)
- Notifications: `notiflix`
- Styling: Tailwind CSS v4 + Mantine CSS
- Font: K2D (`@fontsource/k2d`)

**Path alias:** `@` → `app/src/`

**i18n:** Internationalization configured in `app/src/lib/i18n/`. Translation files in `locales/` directory.

### Database (Prisma + PostgreSQL)

Schema at `server/prisma/schema.prisma`. Models:

| Model           | Table            | Description                              |
| --------------- | ---------------- | ---------------------------------------- |
| `Department`    | `department`     | Department with sections & users         |
| `Section`       | `section`        | Section under department                 |
| `User`          | `user`           | User with auth, role, department/section |
| `UserLog`       | `user_log`       | User change history (audit trail)        |
| `Changelog`     | `update_log`     | Update/changelog entries                 |
| `SystemSetting` | `system_setting` | Key-value system configuration           |

**Enums:** `Status` (active/inactive), `Role` (USER/ADMIN), `ActionType` (CREATE/UPDATE/DELETE/RESET_PASSWORD/CHANGE_PASSWORD), `UpdateType` (FEATURE/BUGFIX/IMPROVEMENT/SECURITY/OTHER)

**Key `User` fields:** `username` (Char 6, unique), `isDefaultPassword` (Boolean), `tokenVersion` (Int), `lastLoginAt`

All models (except SystemSetting) include audit fields: `createdAt`, `createdBy`, `createdByName`, `updatedAt`, `updatedBy`, `updatedByName`.

**Relations:**

- Department → has many Sections (cascade delete)
- Department → has many Users (restrict delete)
- Section → has many Users (set null on delete)

### Testing

**Backend tests** use Vitest + supertest. Prisma is mocked in `server/tests/mocks/prisma.mock.ts`. Test helpers in `server/tests/helpers/test.helper.ts`.

**Frontend tests** use Vitest + jsdom + Testing Library + MSW for API mocking. MSW handlers in `app/src/__tests__/mocks/handlers/`.

## Coding Conventions

- **Language:** Code in English, UI text in Thai (via i18n)
- **Comments:** English, keep minimal — code should be self-documenting
- **Naming:** camelCase for files/variables, PascalCase for components/types
- **Backend pattern:** Route → Service → Prisma (no direct Prisma calls in routes)
- **Frontend pattern:** Feature module with pages, components, hooks, table config, types
- **API responses:** Standardized via `server/src/lib/response.ts`
- **Error handling:** Custom error classes in `server/src/lib/errors.ts`, error codes in `server/src/constants/error-codes.ts`
- **Validation:** Zod schemas for both API input validation and OpenAPI spec generation

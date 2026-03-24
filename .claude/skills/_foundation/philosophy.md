# Coding Philosophy

This document defines the shared coding philosophy applied across all skills.
It is **framework-agnostic** — no library or framework is referenced here.

---

## Architecture

- **Layered separation**: Route/Controller → Service → Data access.
  Routes handle HTTP concerns (request parsing, response formatting).
  Services contain business logic. Data access is the only layer that talks to the database.
- **Validation layer**: Input validation lives in its own schema files, separate from business logic.
  Schemas are the single source of truth for both runtime validation and API documentation.
- **Centralized error handling**: Define custom error classes (NotFound, Conflict, Validation, Unauthorized)
  with error codes. A global error handler catches and formats all errors consistently.
- **Error codes**: Every error response includes a machine-readable code (e.g., `USER_NOT_FOUND`).
  Store all codes in a single constants file for easy lookup.
- **Response format**: All API responses follow a standard shape:
  - Success: `{ data, pagination? }`
  - Error: `{ error: { code, message, details? } }`
- **Pagination**: A shared utility that accepts `page` + `limit`, returns `{ data, total, page, limit, totalPages }`.
- **Audit fields**: Every domain entity includes: `createdAt`, `createdBy`, `createdByName`,
  `updatedAt`, `updatedBy`, `updatedByName`. Populate these automatically via utility helpers.
- **Log events**: Define structured log event templates in a constants file.
  Format: `[DOMAIN] Past-tense-verb entity "identifier" — detail`.

## Data Modeling

- **ID**: Auto-increment integer by default. Use UUID only when explicitly required.
- **Status**: Use an enum (`active`/`inactive`), not a boolean.
- **Table naming**: `snake_case`, singular (e.g., `user`, `department`).
- **Relations**: Define explicit foreign keys with clear cascade/restrict rules.
  - Parent → children: cascade delete only when children have no independent meaning.
  - Parent → dependents: restrict delete, require explicit handling.
- **Indexes**: Add indexes on foreign keys, frequently filtered columns, and unique constraints.
- **Soft delete**: Prefer status-based deactivation over row deletion. Hard delete only when necessary.

## Frontend

- **Feature-based modules**: Each feature is a self-contained folder:
  `types.ts`, `hooks/`, `components/`, `pages/`, `tableConfig.tsx`, `index.ts`.
- **Component patterns**:
  - Drawer/modal forms for create and edit.
  - Confirmation dialog before destructive actions.
  - Action menu per table row (view, edit, delete, etc.).
  - Filter panel with search + select inputs.
- **Data table**: Column definitions in a separate config file, not inside the page component.
- **API layer**: One service file per feature with standard CRUD methods + import/export.
- **Hooks**: Use a factory pattern for CRUD hooks (list, detail, create, update, delete).
  Query keys follow a hierarchical factory: `[entity, 'list', params]`, `[entity, 'detail', id]`.
- **i18n**: Separate translation namespace per feature. UI text never hardcoded.
- **State management**: Server state via data-fetching library. Client state via lightweight store.
  Avoid mixing the two.

## Testing

- **Mock at boundaries**: Mock the data access layer in service tests, mock services in route tests.
  Never mock internal logic.
- **Coverage**: Test happy path + at least 2 error paths per endpoint (not found, validation, permission).
- **Test structure**: `describe(Entity)` → `describe(method)` → `it(should ...)`.
- **Integration tests**: Test actual HTTP request/response cycle. Verify status codes, response shape, headers.
- **Permission tests**: Verify admin-only endpoints reject non-admin users.
- **Mock data**: Define reusable mock data factories in a shared file.

## Naming Conventions

| Target | Convention | Example |
|---|---|---|
| Files (utils, middleware, services) | kebab-case | `pagination.utils.ts` |
| Files (components) | PascalCase | `DepartmentForm.tsx` |
| Variables, functions | camelCase | `getUserById` |
| Types, interfaces, classes | PascalCase | `CreateDepartmentInput` |
| Constants | UPPER_SNAKE_CASE | `AUTH_MISSING_TOKEN` |
| API paths | plural kebab-case | `/departments`, `/system-settings` |
| Database tables | snake_case singular | `department`, `user_log` |
| Enum values | UPPER_SNAKE_CASE | `ACTIVE`, `INACTIVE` |

## Code Style

- Code in English. UI text in the project's target language (via i18n).
- Comments in English. Keep minimal — code should be self-documenting.
- Prefer explicit over implicit. Named exports over default exports.
- One responsibility per file. Services don't import from routes. Routes don't query the database.
- Use path aliases (`@/` → `src/`) for clean imports.
- Constants (messages, error codes, log events) in dedicated files, never inline strings.

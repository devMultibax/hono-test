---
name: generate-fullstack-crud
description: Generate a complete fullstack CRUD feature — database model + backend (route/service/schema) + frontend (feature module with pages/components/hooks). Orchestrates generate-db-model, generate-backend-crud, and generate-frontend-feature in sequence.
disable-model-invocation: true
user-invocable: true
argument-hint: [resource-name]
---

# Generate Fullstack CRUD

Generate a complete fullstack CRUD for: **$ARGUMENTS**

This skill orchestrates the full creation of a new resource across all layers.

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the full tech stack
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review shared principles
3. Find and read 1 existing complete feature (simplest CRUD) as reference across all layers

## Step 0: Gather Requirements

Before generating anything, clarify with the user:

1. **Resource name** — singular (e.g., "Product", "Category")
2. **Fields** — name, type, required/optional, constraints
3. **Relations** — belongs to what? has many what?
4. **Unique constraints** — which fields or combinations must be unique?
5. **Delete strategy** — Cascade, Restrict, or SetNull for each relation
6. **Admin-only or all users?** — who can create/update/delete?
7. **Needs import/export?** — Excel import and export support
8. **Route placement** — protected route or admin route?

If the user already provided enough info, proceed directly.

## Step 1: Database Layer

Follow the `/generate-db-model` pattern:

1. Add model with: auto-increment ID, business fields, status enum, 6 audit fields, relations, indexes, table mapping
2. Add new enums if needed
3. Run migration
4. Regenerate ORM client (if applicable)

## Step 2: Backend Types

Add to backend types file:
- `{Entity}Response` interface (all fields minus sensitive fields)
- `{Entity}WithRelations` interface (if applicable)

## Step 3: Backend CRUD

Follow the `/generate-backend-crud` pattern to create:

1. **Validation schema** — create, update, list query schemas
2. **Service** — class with CRUD methods + format/filter helpers
3. **Route handler** — HTTP endpoints with auth, validation, logging

4. **Constants updates:**
   - Error codes: `{ENTITY}_NOT_FOUND`, `{ENTITY}_INVALID_ID`, `{ENTITY}_NAME_EXISTS`
   - Log events: CREATED, UPDATED, DELETED, IMPORTED
   - Validation messages

5. **Register route** in backend entry point
6. **Add test mock** for the new model

## Step 4: Frontend Types

Add to frontend shared types:
- `{Entity}` interface
- `Create{Entity}Request` interface
- `Update{Entity}Request` interface
- `{Entity}QueryParams` extends base query params
- `{Entity}ListResponse` = paginated response type

## Step 5: Frontend Feature Module

Follow the `/generate-frontend-feature` pattern to create:

1. **API Service** — CRUD + import/export methods
2. **Feature Types** — DrawerState, FormValues, ExportParams
3. **Hooks** — query keys, CRUD mutations, list/detail queries, action handlers
4. **Table Config** — default params, column definitions
5. **Components** — ActionMenu, Form, Drawer, Filters, ExportDrawer
6. **List Page** — 9-section pattern
7. **Feature Index** — barrel exports

## Step 6: Frontend Integration

1. **Route** — register in route config
2. **Sidebar** — add menu entry
3. **i18n** — create translation file

## Execution Order

```
1.  Database model → migrate → regenerate client
2.  Backend types
3.  Backend constants (error codes, log events, messages)
4.  Backend validation schema
5.  Backend service (business logic)
6.  Backend route handler
7.  Register route in entry point
8.  Backend test mock
9.  Frontend shared types
10. Frontend API service
11. Frontend feature types
12. Frontend hooks
13. Frontend table config
14. Frontend components (ActionMenu → Form → Drawer → Filters → ExportDrawer)
15. Frontend list page
16. Frontend feature index
17. Frontend route registration
18. Frontend sidebar menu
19. Frontend i18n translations
```

## Verification Checklist

After generation, verify:

- [ ] Database migration ran successfully
- [ ] ORM client regenerated (if applicable)
- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] API endpoints work (test via API docs or curl)
- [ ] Frontend page renders and CRUD operations work
- [ ] Import/Export works (if applicable)
- [ ] i18n keys are complete (no missing translations)
- [ ] Sidebar navigation works

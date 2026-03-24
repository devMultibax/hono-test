---
name: generate-doc
description: Generate project documentation in Markdown format. Supports multiple doc types — api, permission, database, error-codes, env, middleware, routes, validation, features, changelog, or all. Output is saved to docs/ directory.
disable-model-invocation: true
user-invocable: true
argument-hint: [type: api|permission|database|error-codes|env|middleware|routes|validation|features|changelog|all]
---

# Generate Documentation

Generate documentation type: **$ARGUMENTS**

Output directory: `docs/` (gitignored)

If type is `all`, generate every document type listed below sequentially.

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the project's tech stack
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review shared conventions
3. Find the project entry point, route files, schema/model files, and middleware files

---

## Document Types

### 1. `api` — API Endpoint Documentation

**Output:** `docs/api-endpoints.md`

**How to generate:**
1. Find and read **all route definition files** in the backend
2. For each route file, extract: HTTP method, path (combine mount path from entry point + route path), middleware chain, validation schema name, response type
3. Find and read corresponding validation schema files to extract request body/query fields
4. Read the backend entry point for route mount paths

**Format:**

```markdown
# API Endpoints

> Auto-generated from source code. Do not edit manually.
> Generated: {date}

## Table of Contents
- [Resource Name](#resource-name)
- ...

---

## Resource Name

Base path: `/resources`

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/resources` | Yes | Any | List with pagination |
| GET | `/resources/:id` | Yes | Any | Get by ID |
| POST | `/resources` | Yes | Admin | Create |
| PUT | `/resources/:id` | Yes | Admin | Update |
| DELETE | `/resources/:id` | Yes | Admin | Delete |

### GET `/resources`

**Authentication:** Required
**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page |
| ...

**Response:** `200 OK`
```json
{ "data": [...], "pagination": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 } }
```

**Error Responses:**
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input |
| 401 | AUTH_UNAUTHORIZED | Not authenticated |
```

**Rules:**
- Read actual validation schemas for exact fields, types, and rules
- Read actual route handlers for auth/permission requirements
- Group by route file / base path
- List all possible error codes per endpoint by reading the service layer

---

### 2. `permission` — Permission & Access Control Matrix

**Output:** `docs/permission-matrix.md`

**How to generate:**
1. Find and read all route files — check middleware chains for auth/permission
2. Find and read frontend menu config for UI permission mapping
3. Find and read frontend route config for route guards

**Format:**

```markdown
# Permission & Access Control Matrix

> Auto-generated from source code. Do not edit manually.
> Generated: {date}

## Roles
| Role | Description |
|------|-------------|

## Backend API Permissions

### Summary Table
| Resource | List | View | Create | Update | Delete | Import | Export |
|----------|------|------|--------|--------|--------|--------|--------|

Legend: Public = no auth, Auth = any authenticated, USER = USER+ADMIN, ADMIN = admin only

### Detailed Permissions
(Per resource: Method, Path, Required Role, Middleware chain)

## Frontend Page Permissions
### Sidebar Menu Visibility
### Route Protection
```

**Rules:**
- Scan every middleware registration and route handler
- Cross-reference backend and frontend permissions
- Highlight mismatches if any

---

### 3. `database` — Database Schema Documentation

**Output:** `docs/database-schema.md`

**How to generate:**
1. Find and read the database schema definition (Prisma schema, Drizzle schema, TypeORM entities, etc.)
2. Parse all models, enums, relations, indexes, and constraints

**Format:**

```markdown
# Database Schema

> Auto-generated from schema. Do not edit manually.
> Generated: {date}

## ER Diagram
```mermaid
erDiagram
    Parent ||--o{ Child : "has many"
    ...
```

## Enums
| Enum | Values | Used In |

## Models

### ModelName
Table: `table_name`

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|

**Relations:**
| Relation | Target | Type | On Delete |

**Indexes:** ...

## Relations Summary
| From | To | Type | FK Field | On Delete |

## Audit Fields Convention
(Document the standard audit field pattern)
```

**Rules:**
- Parse every model field with exact types from the schema
- Generate Mermaid ER diagram
- Document all relations with cascade/restrict/setNull strategies

---

### 4. `error-codes` — Error Code Reference

**Output:** `docs/error-codes.md`

**How to generate:**
1. Find and read the error codes constants file
2. Find and read the error classes file for HTTP status mapping
3. Read service files to find which codes are used in what context

**Format:**

```markdown
# Error Code Reference

> Auto-generated from source code. Do not edit manually.
> Generated: {date}

## Error Classes
| Class | HTTP Status | Default Message |

## Error Codes by Domain
### Domain
| Code | HTTP Status | Description | Thrown By |

## Response Format
(Document standard error response shape)
```

---

### 5. `env` — Environment Variables Reference

**Output:** `docs/environment-variables.md`

**How to generate:**
1. Find and read the environment validation file (Zod schema, config module, etc.)
2. Find and read `.env.example` if it exists

**Format:**

```markdown
# Environment Variables

> Auto-generated from env validation. Do not edit manually.
> Generated: {date}

## Required Variables
| Variable | Type | Validation | Example |

## Optional Variables (with defaults)
| Variable | Type | Default | Validation | Description |

## Production Warnings
(List any production-specific checks)
```

---

### 6. `middleware` — Middleware Stack Documentation

**Output:** `docs/middleware-stack.md`

**How to generate:**
1. Read the backend entry point for global middleware order
2. Find and read each middleware file

**Format:**

```markdown
# Middleware Stack

> Auto-generated from source code. Do not edit manually.
> Generated: {date}

## Request Flow
(ASCII or text diagram showing middleware execution order)

## Global Middleware
| Order | Middleware | File | Purpose |

## Route-level Middleware
| Middleware | File | Purpose | Used In |

## Middleware Details
(Per middleware: purpose, configuration, error responses)
```

---

### 7. `routes` — Frontend Routes & Navigation

**Output:** `docs/frontend-routes.md`

**How to generate:**
1. Find and read the frontend route configuration
2. Find and read the sidebar/navigation menu config
3. Find and read route guard components

**Format:**

```markdown
# Frontend Routes & Navigation

> Auto-generated from source code. Do not edit manually.
> Generated: {date}

## Route Tree
(Visual tree of all routes with protection level)

## Pages
| Path | Component | Guard | i18n Title Key |

## Sidebar Menu
| Menu | Path | Icon | Visible To |
```

---

### 8. `validation` — Validation Rules Reference

**Output:** `docs/validation-rules.md`

**How to generate:**
1. Find and read all validation schema files
2. Find and read validation message constants (if applicable)

**Format:**

```markdown
# Validation Rules

> Auto-generated from schemas. Do not edit manually.
> Generated: {date}

## Resource Name
### Create
| Field | Type | Required | Rules | Message |

### Update
(Same fields but all optional + status)

## Pagination (shared)
| Param | Type | Default | Max | Description |
```

---

### 9. `features` — Feature Module Inventory

**Output:** `docs/feature-inventory.md`

**How to generate:**
1. Scan the frontend features directory
2. For each feature, check which files exist (pages, components, hooks, table config, types)
3. Read barrel exports

**Format:**

```markdown
# Feature Module Inventory

> Auto-generated from source code. Do not edit manually.
> Generated: {date}

## Summary
| Feature | Pages | Components | Hooks | Table Config | Types | API Service |

## Feature Details
### feature-name
**Path:** ...
**Pages:** ...
**Components:** ...
**Hooks:** ...
**Table Config:** ...
**API Service:** ...
```

---

### 10. `changelog` — Release Notes

**Output:** `docs/changelog.md`

**How to generate:**
1. Read git log for recent commits
2. Read changelog data from database/service (if accessible)
3. Group entries by version/date and type

**Format:**

```markdown
# Changelog

> Auto-generated. Do not edit manually.
> Generated: {date}

## [Unreleased]
### Features
### Bug Fixes
### Improvements
### Security
```

---

## Generation Rules

1. **Always read actual source code** — never hardcode or guess values
2. **Header format** — every doc starts with title, auto-generated notice, and generation date
3. **Use tables** for structured data (endpoints, fields, permissions)
4. **Use Mermaid** for diagrams (ER, flow charts) — GitHub renders these natively
5. **Use code blocks** for JSON examples and file paths
6. **Group logically** — by domain, feature, or resource
7. **Include cross-references** — link between related docs
8. **Output to `docs/`** — ensure the directory exists, create if not
9. **Overwrite existing** — regenerate the entire file each time (not append)

## Running

```bash
# Generate specific doc
/generate-doc api
/generate-doc permission
/generate-doc database

# Generate all docs
/generate-doc all
```

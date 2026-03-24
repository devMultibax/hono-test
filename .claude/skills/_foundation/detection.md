# Tech Stack Detection

Before generating any code, **every skill must detect the project's tech stack**.
Follow these steps in order. Stop early if you have enough information.

---

## Step 1: Read Project Instructions

Read `CLAUDE.md` (root or workspace). If it exists, treat it as the primary source of truth
for architecture, conventions, file paths, and tooling.

## Step 2: Read Package Manifests

Read `package.json` files (root, and any workspace folders like `app/`, `server/`, `client/`, `api/`).
Map dependencies to categories:

| Category | Look for |
|---|---|
| **Backend framework** | `hono`, `express`, `fastify`, `@nestjs/core`, `koa` |
| **ORM / data access** | `@prisma/client`, `drizzle-orm`, `typeorm`, `mongoose`, `sequelize`, `kysely` |
| **Validation** | `zod`, `joi`, `yup`, `class-validator`, `valibot`, `ajv` |
| **Frontend framework** | `react`, `vue`, `svelte`, `solid-js`, `angular` |
| **UI library** | `@mantine/core`, `@mui/material`, `antd`, `@chakra-ui/react`, `vuetify` |
| **UI (file-based)** | `components/ui/` directory → shadcn/ui |
| **Data fetching** | `@tanstack/react-query`, `swr`, `@trpc/client`, `@apollo/client` |
| **State management** | `zustand`, `@reduxjs/toolkit`, `pinia`, `jotai`, `valtio` |
| **Form library** | `@mantine/form`, `react-hook-form`, `formik`, `vee-validate` |
| **Test runner** | `vitest`, `jest`, `@playwright/test`, `cypress` |
| **CSS / styling** | `tailwindcss`, `@emotion/react`, `styled-components`, `sass` |
| **HTTP client** | `axios`, `ky`, `ofetch`, built-in `fetch` |

## Step 3: Read Existing Features

Find and read **1-2 existing feature implementations** to learn actual patterns:

- **Backend**: Pick a route file + its corresponding service. Note:
  - How routes are registered (middleware, validation, handler signature)
  - How services call the database (ORM API style)
  - Error handling pattern (custom errors, try/catch, error codes)
  - Response format (helper functions, direct JSON)
  - Logging approach

- **Frontend**: Pick a feature folder. Note:
  - File structure (which files exist, naming)
  - Component library usage (imports, form components, layout)
  - Hook patterns (data fetching, mutations, query keys)
  - State management approach
  - i18n usage

## Step 4: Check Code Style

Read style configuration files if they exist:
- `.prettierrc` / `.prettierrc.json` / `prettier.config.js`
- `.editorconfig`
- `.eslintrc` / `eslint.config.js`
- `tsconfig.json` (strict mode, path aliases)

If no config files exist, infer from existing code:
- Tabs vs spaces, indent size
- Semicolons or not
- Single vs double quotes
- Trailing commas

## Output

After detection, you should have a clear picture of:

1. **Backend**: framework + ORM + validation library
2. **Frontend**: framework + UI library + data fetching + form library + state
3. **Testing**: runner + assertion style + mock approach
4. **Style**: formatting rules + naming patterns

Use this detected stack to guide all code generation.
If a framework is not recognized, **fall back to reading existing code** and replicate its patterns exactly.
Never guess — if unsure, read more files.

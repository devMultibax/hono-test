---
name: generate-frontend-feature
description: Generate a complete frontend feature module (pages, components, hooks, table config, types, API service) for a new resource following the project's feature-based architecture.
disable-model-invocation: true
user-invocable: true
argument-hint: [feature-name]
---

# Generate Frontend Feature Module

Generate complete frontend feature module for: **$ARGUMENTS**

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the project's frontend framework, UI library, data fetching, and form library
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review shared coding principles
3. Find and read 1 existing feature module (simplest CRUD) as reference — all its files
4. Read the shared types file for existing type patterns
5. Read the route configuration to see how pages are registered
6. Confirm the backend API exists for this resource
7. Ask the user what fields the resource has if not provided

## Abstract Specification

Generate a self-contained **feature module** with these files:

### 1. Types (`types.ts`)

- Re-export entity types from shared types
- Define `DrawerState` discriminated union: `closed | create | detail(id) | edit(id)`
- Define `FormValues` interface (form field types)
- Define `ExportParams` interface (export filter fields)

### 2. API Service (`api/services/{feature}.api.ts`)

Standard CRUD methods:
- `getAll(params)` — paginated list
- `getById(id)` — single record with relations
- `create(data)` — create new
- `update(id, data)` — update existing
- `delete(id)` — delete
- `exportExcel(params, signal?)` — download Excel file
- `downloadTemplate()` — download import template
- `import(file)` — upload Excel file

### 3. Hooks (`hooks/use{Entities}.ts`)

- **Query keys** — hierarchical factory: `all`, `lists`, `list(params)`, `details`, `detail(id)`
- **CRUD mutations** — using the project's hook factory if available
- **List query** — paginated with placeholder data
- **Detail query** — single record, enabled only when ID > 0
- **Status update mutation** — toggle active/inactive
- **Action handlers** — `handleDelete`, `handleStatusChange`, `handleBulkDelete`, `handleImportSuccess` with confirmation dialogs and i18n messages

### 4. Table Config (`{feature}Table.config.tsx`)

- `DEFAULT_PARAMS` — default page, limit, sort, order
- `SORT_FIELD_MAP` — map column IDs to API sort fields (if needed)
- Column definitions using the project's table library
- Columns: business fields + status (with toggle switch) + actions (action menu)
- Role-based column visibility for edit actions

### 5. Components

#### ActionMenu (`{Entity}ActionMenu.tsx`)
- Config-driven action buttons: view, edit, delete
- Role-based visibility per action
- Loading state for delete

#### Form (`{Entity}Form.tsx`)
- Form with validation rules
- Pre-populate from `initialData` for edit mode
- Submit handler transforms form values → API request format
- Cancel button + submit button

#### Drawer (`{Entity}Drawer.tsx`)
- 3 content modes: CreateContent, EditContent, DetailContent
- Create: form + create mutation
- Edit: fetch record + form + update mutation
- Detail: fetch record + read-only display

#### Filters (`{Entity}Filters.tsx`)
- Shared `FilterFields` component (reused in ExportDrawer)
- Search input + select filters
- All filters are optional, update parent state on change

#### ExportDrawer (`{Entity}ExportDrawer.tsx`)
- Reuse `FilterFields` from Filters component
- Confirm before export
- Pass filter params to export API

### 6. List Page (`pages/{Entity}ListPage.tsx`)

Follow 9-section pattern:
1. **Hooks & Context** — user role, translation, page actions
2. **Local UI State** — export drawer opened, drawer state
3. **Feature Hooks** — action handlers from hooks file
4. **Stable Callbacks** — openCreate, openDetail, openEdit, closeDrawer
5. **Table State** — pagination, sorting, filtering via data table hook
6. **Data Fetching** — list query + refresh + loading progress
7. **Column Config** — columns with callbacks and role
8. **Header Actions** — Refresh, Export, Import, Create buttons
9. **Render** — Filters + ExportDrawer + Drawer + DataTable

### 7. Feature Index (`index.ts`)

Barrel exports: ListPage, hooks, query keys, types.

### 8. Update Supporting Files

- **Shared types** — add entity interfaces
- **Route config** — add page route
- **Sidebar menu** — add navigation entry (if applicable)
- **i18n** — add translation file with all keys

## Framework-Specific Guidance

### UI Library

**If Mantine:**
```tsx
import { TextInput, Select, Button, Stack, Group, Drawer, Paper, SimpleGrid } from '@mantine/core'
import { useForm } from '@mantine/form'
// Form: useForm({ initialValues, validate, validateInputOnBlur: true })
// Drawer: <DrawerForm opened={...} onClose={...} title={...}>
```

**If shadcn/ui:**
```tsx
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// Form: react-hook-form useForm + zodResolver
```

**If MUI:**
```tsx
import { TextField, Select, MenuItem, Button, Stack, Drawer, Paper, Grid } from '@mui/material'
// Form: react-hook-form or MUI useFormControl
```

### Data Fetching

**If TanStack Query:**
```typescript
const keys = createQueryKeys<Params>('entities')
const { data } = useQuery({ queryKey: keys.list(params), queryFn: () => api.getAll(params).then(r => r.data) })
const mutation = useMutation({ mutationFn: api.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.lists() }) })
```

**If SWR:**
```typescript
const { data } = useSWR(['entities', params], () => api.getAll(params))
const { trigger } = useSWRMutation('entities', (_, { arg }) => api.create(arg))
```

### State Management

**If Zustand:**
```typescript
const useAuthStore = create<AuthState>((set) => ({ user: null, setUser: (user) => set({ user }) }))
```

**If Redux Toolkit:**
```typescript
const slice = createSlice({ name: 'auth', initialState, reducers: { setUser: (state, action) => { state.user = action.payload } } })
```

## Naming Conventions

| Concept | Format | Example |
|---------|--------|---------|
| Feature dir | `features/{feature}/` | `products/` |
| API service | `api/services/{feature}.api.ts` | `product.api.ts` |
| API object | `{entity}Api` | `productApi` |
| Query keys | `{entity}Keys` | `productKeys` |
| Hooks file | `hooks/use{Entities}.ts` | `useProducts.ts` |
| Table config | `{feature}Table.config.tsx` | `productTable.config.tsx` |
| List page | `pages/{Entity}ListPage.tsx` | `ProductListPage.tsx` |
| Drawer | `components/{Entity}Drawer.tsx` | `ProductDrawer.tsx` |
| Form | `components/{Entity}Form.tsx` | `ProductForm.tsx` |
| Filters | `components/{Entity}Filters.tsx` | `ProductFilters.tsx` |
| ActionMenu | `components/{Entity}ActionMenu.tsx` | `ProductActionMenu.tsx` |
| i18n namespace | `{entities}` | `products` |

## After Generation Checklist

- [ ] Types added to shared types file
- [ ] Route registered in route config
- [ ] i18n translation file created
- [ ] Sidebar menu entry added (if applicable)
- [ ] Feature barrel export in `index.ts`
- [ ] Backend API exists for all endpoints used

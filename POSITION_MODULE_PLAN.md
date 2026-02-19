# Implementation Plan: Position Module

> Clone จาก Department Module
> วันที่: 2026-02-18

---

## 1. File Structure — รายชื่อไฟล์ที่ต้องสร้างใหม่

### 1.1 Backend (`server/`)

| # | Source (department) | Target (position) |
|---|---|---|
| 1 | `server/src/schemas/department.ts` | `server/src/schemas/position.ts` |
| 2 | `server/src/services/department.service.ts` | `server/src/services/position.service.ts` |
| 3 | `server/src/controllers/department.controller.ts` | `server/src/controllers/position.controller.ts` |
| 4 | `server/src/routes/department.routes.ts` | `server/src/routes/position.routes.ts` |
| 5 | `server/tests/unit/services/department.service.test.ts` | `server/tests/unit/services/position.service.test.ts` |
| 6 | `server/tests/integration/routes/department.routes.test.ts` | `server/tests/integration/routes/position.routes.test.ts` |

### 1.2 Frontend (`app/`)

| # | Source (departments) | Target (positions) |
|---|---|---|
| 7 | `app/src/features/departments/types.ts` | `app/src/features/positions/types.ts` |
| 8 | `app/src/features/departments/index.ts` | `app/src/features/positions/index.ts` |
| 9 | `app/src/features/departments/departmentTable.config.tsx` | `app/src/features/positions/positionTable.config.tsx` |
| 10 | `app/src/features/departments/hooks/useDepartments.ts` | `app/src/features/positions/hooks/usePositions.ts` |
| 11 | `app/src/features/departments/pages/DepartmentListPage.tsx` | `app/src/features/positions/pages/PositionListPage.tsx` |
| 12 | `app/src/features/departments/components/DepartmentForm.tsx` | `app/src/features/positions/components/PositionForm.tsx` |
| 13 | `app/src/features/departments/components/DepartmentFilters.tsx` | `app/src/features/positions/components/PositionFilters.tsx` |
| 14 | `app/src/features/departments/components/DepartmentDrawer.tsx` | `app/src/features/positions/components/PositionDrawer.tsx` |
| 15 | `app/src/features/departments/components/DepartmentActionMenu.tsx` | `app/src/features/positions/components/PositionActionMenu.tsx` |
| 16 | `app/src/features/departments/components/DepartmentExportDrawer.tsx` | `app/src/features/positions/components/PositionExportDrawer.tsx` |
| 17 | `app/src/api/services/department.api.ts` | `app/src/api/services/position.api.ts` |

### 1.3 Internationalization

| # | Source | Target |
|---|---|---|
| 18 | `app/src/lib/i18n/locales/th/departments.json` | `app/src/lib/i18n/locales/th/positions.json` |

### 1.4 Database (Prisma)

| # | Action | Detail |
|---|---|---|
| 19 | เพิ่ม Model ใน Prisma Schema | `server/prisma/schema.prisma` — เพิ่ม `Position` model |
| 20 | รัน Prisma Migration | `npx prisma migrate dev --name add_position_table` |

---

## 2. Search & Replace Strategy — รายการที่ต้องแก้ไขชื่อ

### 2.1 กฎการแทนที่ (Naming Convention)

| Pattern | Department → Position |
|---|---|
| PascalCase (singular) | `Department` → `Position` |
| PascalCase (plural) | `Departments` → `Positions` |
| camelCase (singular) | `department` → `position` |
| camelCase (plural) | `departments` → `positions` |
| UPPER_CASE | `DEPARTMENT` → `POSITION` |
| kebab-case | `department` → `position` |
| url path | `/departments` → `/positions` |
| prisma model | `Department` → `Position` |
| db table | `department` → `position` |

---

### 2.2 Backend Files

#### `server/src/schemas/position.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `createDepartmentSchema` | `createPositionSchema` |
| `updateDepartmentSchema` | `updatePositionSchema` |
| `listDepartmentsQuerySchema` | `listPositionsQuerySchema` |

---

#### `server/src/services/position.service.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentService` | `PositionService` |
| `departmentService` | `positionService` |
| `prisma.department` | `prisma.position` |
| `'department'` (string literals) | `'position'` |
| `import { createDepartmentSchema` | `import { createPositionSchema` |
| `createDepartmentSchema` | `createPositionSchema` |
| `updateDepartmentSchema` | `updatePositionSchema` |
| `listDepartmentsQuerySchema` | `listPositionsQuerySchema` |
| `sections` (relation check) | ลบออก หรือแทนด้วย relation ที่เกี่ยวข้อง |
| `users` (relation check) | ลบออก หรือคงไว้ถ้า Position มี users |

> **หมายเหตุ:** ตรวจสอบ logic ใน `delete()` ที่เช็ค dependent relations (`sections`, `users`) — Position อาจไม่มี `sections` ให้ปรับตามจริง

---

#### `server/src/controllers/position.controller.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `departmentExportColumns` | `positionExportColumns` |
| `'Department'` | `'Position'` |
| `'department'` | `'position'` |

---

#### `server/src/routes/position.routes.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `departmentRoutes` | `positionRoutes` |
| `import { departmentService` | `import { positionService` |
| `createDepartmentSchema` | `createPositionSchema` |
| `updateDepartmentSchema` | `updatePositionSchema` |
| `listDepartmentsQuerySchema` | `listPositionsQuerySchema` |

---

#### `server/src/index.ts` (แก้ไขไฟล์เดิม — ไม่สร้างใหม่)

เพิ่ม 2 บรรทัดนี้:

```typescript
// Import
import { positionRoutes } from './routes/position.routes'

// Register route
app.route('/positions', positionRoutes)
```

---

#### `server/prisma/schema.prisma` (แก้ไขไฟล์เดิม — ไม่สร้างใหม่)

เพิ่ม model ใหม่:

```prisma
model Position {
  id            Int       @id @default(autoincrement())
  name          String    @unique @db.VarChar(100)
  status        Status    @default(active)
  createdAt     DateTime  @default(now())
  createdBy     String    @db.VarChar(100)
  createdByName String    @default("") @db.VarChar(200)
  updatedAt     DateTime?
  updatedBy     String?   @db.VarChar(100)
  updatedByName String?   @db.VarChar(200)

  users User[]   // เพิ่มถ้า Position มี relation กับ User

  @@index([status])
  @@index([createdAt])
  @@map("position")
}
```

---

### 2.3 Frontend Files

#### `app/src/features/positions/types.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentQueryParams` | `PositionQueryParams` |

---

#### `app/src/features/positions/positionTable.config.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentTableConfig` | `PositionTableConfig` |
| `departmentTableConfig` | `positionTableConfig` |
| `Department` | `Position` |
| `department` | `position` |
| `'departments'` (i18n namespace) | `'positions'` |

---

#### `app/src/features/positions/hooks/usePositions.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `useDepartments` | `usePositions` |
| `useDepartment` | `usePosition` |
| `useCreateDepartment` | `useCreatePosition` |
| `useUpdateDepartment` | `useUpdatePosition` |
| `useDeleteDepartment` | `useDeletePosition` |
| `useBulkDeleteDepartments` | `useBulkDeletePositions` |
| `useUpdateDepartmentStatus` | `useUpdatePositionStatus` |
| `useDepartmentActions` | `usePositionActions` |
| `departmentApi` | `positionApi` |
| `'departments'` (query key) | `'positions'` |
| `'departments'` (i18n namespace) | `'positions'` |
| `Department` (type) | `Position` |

---

#### `app/src/features/positions/pages/PositionListPage.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentListPage` | `PositionListPage` |
| `useDepartmentActions` | `usePositionActions` |
| `DepartmentFilters` | `PositionFilters` |
| `DepartmentDrawer` | `PositionDrawer` |
| `DepartmentExportDrawer` | `PositionExportDrawer` |
| `departmentTableConfig` | `positionTableConfig` |
| `'departments'` (i18n namespace) | `'positions'` |

---

#### `app/src/features/positions/components/PositionForm.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentForm` | `PositionForm` |
| `CreateDepartmentRequest` | `CreatePositionRequest` |
| `UpdateDepartmentRequest` | `UpdatePositionRequest` |
| `useCreateDepartment` | `useCreatePosition` |
| `useUpdateDepartment` | `useUpdatePosition` |
| `'departments'` (i18n namespace) | `'positions'` |

---

#### `app/src/features/positions/components/PositionDrawer.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentDrawer` | `PositionDrawer` |
| `DepartmentForm` | `PositionForm` |
| `useDepartment` | `usePosition` |
| `'departments'` (i18n namespace) | `'positions'` |
| `Department` (type) | `Position` |

---

#### `app/src/features/positions/components/PositionFilters.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentFilters` | `PositionFilters` |
| `DepartmentQueryParams` | `PositionQueryParams` |
| `'departments'` (i18n namespace) | `'positions'` |

---

#### `app/src/features/positions/components/PositionActionMenu.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentActionMenu` | `PositionActionMenu` |
| `Department` (type) | `Position` |
| `'departments'` (i18n namespace) | `'positions'` |

---

#### `app/src/features/positions/components/PositionExportDrawer.tsx`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `DepartmentExportDrawer` | `PositionExportDrawer` |
| `DepartmentQueryParams` | `PositionQueryParams` |
| `'departments'` (i18n namespace) | `'positions'` |

---

#### `app/src/features/positions/index.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| export paths ทั้งหมดจาก `departments/` | `positions/` |

---

#### `app/src/api/services/position.api.ts`

| ค้นหา | แทนที่ด้วย |
|---|---|
| `departmentApi` | `positionApi` |
| `DepartmentApi` | `PositionApi` |
| `/departments` (endpoint) | `/positions` |
| `Department` (type) | `Position` |
| `DepartmentQueryParams` | `PositionQueryParams` |
| `CreateDepartmentRequest` | `CreatePositionRequest` |
| `UpdateDepartmentRequest` | `UpdatePositionRequest` |

---

### 2.4 ไฟล์ที่ต้องแก้ไขเพิ่มเติม (ไม่สร้างใหม่)

| ไฟล์ | สิ่งที่ต้องเพิ่ม |
|---|---|
| `app/src/types/index.ts` | เพิ่ม interface `Position`, `CreatePositionRequest`, `UpdatePositionRequest`, `PositionQueryParams` |
| `app/src/routes/index.tsx` | เพิ่ม route `/positions` → `PositionListPage` |
| `app/src/components/layout/sidebarMenu.config.ts` | เพิ่ม menu item "ตำแหน่ง" (ADMIN only) |
| `app/src/lib/i18n/index.ts` (หรือ i18n config) | เพิ่ม namespace `positions` |

---

### 2.5 i18n — `app/src/lib/i18n/locales/th/positions.json`

เปลี่ยนข้อความจาก "แผนก" → "ตำแหน่ง" ทุกจุด:

| key | ค่าเดิม (departments) | ค่าใหม่ (positions) |
|---|---|---|
| `title` | `"แผนก"` | `"ตำแหน่ง"` |
| `createTitle` | `"เพิ่มแผนก"` | `"เพิ่มตำแหน่ง"` |
| `editTitle` | `"แก้ไขแผนก"` | `"แก้ไขตำแหน่ง"` |
| `detailTitle` | `"รายละเอียดแผนก"` | `"รายละเอียดตำแหน่ง"` |
| `name.label` | `"ชื่อแผนก"` | `"ชื่อตำแหน่ง"` |
| `name.placeholder` | `"ระบุชื่อแผนก"` | `"ระบุชื่อตำแหน่ง"` |
| `deleteConfirm.title` | `"ลบแผนก"` | `"ลบตำแหน่ง"` |
| `deleteConfirm.message` | `"...ลบแผนก..."` | `"...ลบตำแหน่ง..."` |
| `messages.createSuccess` | `"เพิ่มแผนกสำเร็จ"` | `"เพิ่มตำแหน่งสำเร็จ"` |
| `messages.updateSuccess` | `"แก้ไขแผนกสำเร็จ"` | `"แก้ไขตำแหน่งสำเร็จ"` |
| `messages.deleteSuccess` | `"ลบแผนกสำเร็จ"` | `"ลบตำแหน่งสำเร็จ"` |

---

## 3. Checklist — การตรวจสอบความถูกต้อง

### Phase 1: Database

- [ ] เพิ่ม `Position` model ใน `schema.prisma` ครบทุก field (id, name, status, audit fields)
- [ ] ใส่ `@@map("position")` และ `@@index` ให้ถูกต้อง
- [ ] รัน `npx prisma migrate dev` สำเร็จโดยไม่มี error
- [ ] รัน `npx prisma generate` สำเร็จ (Prisma Client อัปเดตแล้ว)
- [ ] ตรวจสอบ `prisma.position` ใช้งานได้ใน TypeScript (type check ผ่าน)
- [ ] ถ้าเพิ่ม relation `users User[]` — ตรวจสอบว่า `User` model มี `positionId` field และ relation กลับแล้ว

### Phase 2: Backend — Schemas & Validation

- [ ] `server/src/schemas/position.ts` สร้างแล้ว
- [ ] `createPositionSchema` validate `name` (min 1, max 100)
- [ ] `updatePositionSchema` validate `name` (optional) และ `status` (optional)
- [ ] `listPositionsQuerySchema` รวม pagination + search + status filter
- [ ] ทดสอบ schema validation ด้วย invalid input → error message ถูกต้อง

### Phase 3: Backend — Service

- [ ] `server/src/services/position.service.ts` สร้างแล้ว
- [ ] `getAll()` — รองรับ pagination, search, status filter
- [ ] `getById()` — ดึง position เดียวได้, คืน null ถ้าไม่พบ
- [ ] `create()` — ตรวจ duplicate name ก่อน insert
- [ ] `update()` — ตรวจ duplicate name (ยกเว้น id ตัวเอง) ก่อน update
- [ ] `delete()` — ตรวจ dependent relations (users) ก่อนลบ ถ้ามี
- [ ] ไม่มีคำว่า `department` หลงเหลือใน service file

### Phase 4: Backend — Routes & Controller

- [ ] `server/src/routes/position.routes.ts` สร้างแล้ว
- [ ] `server/src/controllers/position.controller.ts` สร้างแล้ว (export columns config)
- [ ] Routes ครบ: `GET /`, `GET /template`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`, `GET /export/excel`, `POST /import`
- [ ] Auth middleware ครอบทุก route
- [ ] Admin permission check ครอบ: POST, PUT, DELETE, POST /import
- [ ] `server/src/index.ts` — `app.route('/positions', positionRoutes)` เพิ่มแล้ว
- [ ] ไม่มีคำว่า `department` หลงเหลือใน routes/controller file

### Phase 5: Frontend — Types & API Client

- [ ] `app/src/types/index.ts` — เพิ่ม `Position`, `CreatePositionRequest`, `UpdatePositionRequest`, `PositionQueryParams` แล้ว
- [ ] `app/src/api/services/position.api.ts` สร้างแล้ว
- [ ] `positionApi.getAll()` — เรียก `/positions` ถูกต้อง
- [ ] `positionApi.getById()` — เรียก `/positions/:id` ถูกต้อง
- [ ] `positionApi.create()` — เรียก `POST /positions` ถูกต้อง
- [ ] `positionApi.update()` — เรียก `PUT /positions/:id` ถูกต้อง
- [ ] `positionApi.delete()` — เรียก `DELETE /positions/:id` ถูกต้อง
- [ ] `positionApi.exportExcel()` — เรียก `/positions/export/excel` ถูกต้อง
- [ ] `positionApi.downloadTemplate()` — เรียก `/positions/template` ถูกต้อง
- [ ] `positionApi.import()` — เรียก `POST /positions/import` ถูกต้อง

### Phase 6: Frontend — Hooks

- [ ] `app/src/features/positions/hooks/usePositions.ts` สร้างแล้ว
- [ ] `usePositions()` — query key ใช้ `'positions'`
- [ ] `usePosition(id)` — query key ใช้ `['positions', id]`
- [ ] `useCreatePosition()` — invalidate `'positions'` หลัง mutation
- [ ] `useUpdatePosition()` — invalidate `'positions'` หลัง mutation
- [ ] `useDeletePosition()` — invalidate `'positions'` หลัง mutation
- [ ] `useBulkDeletePositions()` — invalidate `'positions'` หลัง mutation
- [ ] `useUpdatePositionStatus()` — invalidate `'positions'` หลัง mutation
- [ ] `usePositionActions()` — แสดง confirmation dialog ก่อน delete
- [ ] ไม่มีคำว่า `department` หลงเหลือใน hook file

### Phase 7: Frontend — Components

- [ ] `PositionListPage.tsx` — render ตาราง + filter + pagination ได้ถูกต้อง
- [ ] `PositionForm.tsx` — form fields ถูกต้อง, validation ผ่าน
- [ ] `PositionFilters.tsx` — filter by status และ search ทำงานได้
- [ ] `PositionDrawer.tsx` — เปิด/ปิด drawer สำหรับ create/edit/view ได้
- [ ] `PositionActionMenu.tsx` — ปุ่ม View, Edit, Delete แสดงถูกต้องตาม permission
- [ ] `PositionExportDrawer.tsx` — export Excel ทำงานได้
- [ ] `positionTable.config.tsx` — column config ถูกต้อง (Name, Status, Actions)
- [ ] ไม่มี component ใดนำเข้า (import) จาก `departments/` folder ผิดพลาด

### Phase 8: Frontend — i18n

- [ ] `app/src/lib/i18n/locales/th/positions.json` สร้างแล้ว
- [ ] i18n namespace `positions` ถูก register ใน i18n config
- [ ] ข้อความภาษาไทยใช้คำว่า "ตำแหน่ง" แทน "แผนก" ทุกจุด
- [ ] ทุก component ที่ใช้ `useTranslation('departments')` เปลี่ยนเป็น `useTranslation('positions')` แล้ว
- [ ] ทดสอบ render หน้าจอ — ไม่มีข้อความ missing translation key

### Phase 9: Frontend — Routing & Navigation

- [ ] `app/src/routes/index.tsx` — เพิ่ม route `/positions` → `PositionListPage` แล้ว
- [ ] `app/src/components/layout/sidebarMenu.config.ts` — เพิ่ม menu "ตำแหน่ง" แล้ว
- [ ] Menu item มี `role: ['ADMIN']` (หรือตาม permission ที่ต้องการ)
- [ ] Navigate ไปหน้า `/positions` ได้โดยไม่ 404
- [ ] Sidebar แสดง menu "ตำแหน่ง" เมื่อ login เป็น ADMIN

### Phase 10: ทดสอบ End-to-End

- [ ] เปิดหน้า `/positions` — แสดงตารางได้ (ว่างเปล่าหรือมีข้อมูล seed)
- [ ] สร้าง position ใหม่ — บันทึกสำเร็จ, แสดงใน list
- [ ] แก้ไข position — บันทึกสำเร็จ, ข้อมูลอัปเดตใน list
- [ ] ลบ position — confirmation dialog แสดง, ลบสำเร็จ, ออกจาก list
- [ ] Filter by status — แสดงผลถูกต้อง
- [ ] Search by name — แสดงผลถูกต้อง
- [ ] Export Excel — ดาวน์โหลดไฟล์ได้ มีข้อมูลถูกต้อง
- [ ] Import Excel — อัปโหลดไฟล์ได้ ข้อมูลเพิ่มใน DB
- [ ] ทดสอบ permission: user ทั่วไปเห็นเฉพาะ read, admin เห็น create/edit/delete

### Phase 11: Unit & Integration Tests

- [ ] `server/tests/unit/services/position.service.test.ts` สร้างแล้ว
- [ ] Test cases ครอบ: getAll, getById, create (ปกติ + duplicate), update, delete (ปกติ + มี relation)
- [ ] `server/tests/integration/routes/position.routes.test.ts` สร้างแล้ว
- [ ] Test cases ครอบทุก endpoint (GET, POST, PUT, DELETE)
- [ ] รัน test suite ทั้งหมดผ่าน — `npm test` หรือ `bun test` ไม่มี fail

### Phase 12: Code Quality

- [ ] TypeScript compile (`tsc --noEmit`) ผ่านโดยไม่มี error ทั้ง frontend และ backend
- [ ] ไม่มี `any` type ที่ไม่ได้ตั้งใจ
- [ ] ไม่มีคำว่า `department` หลงเหลือในไฟล์ position ใดๆ (ตรวจด้วย search)
- [ ] Barrel export `app/src/features/positions/index.ts` export ทุก component ครบ
- [ ] Prisma Client type สำหรับ `Position` ถูกต้องทุก field

---

## Quick Reference: คำสั่ง Search หลังสร้างเสร็จ

ใช้คำสั่งนี้เพื่อตรวจว่าไม่มี "department" หลงเหลือในไฟล์ position:

```bash
# ตรวจหา "department" ที่หลงเหลือในโฟลเดอร์ positions/
grep -ri "department" server/src/routes/position.routes.ts
grep -ri "department" server/src/services/position.service.ts
grep -ri "department" app/src/features/positions/
grep -ri "department" app/src/api/services/position.api.ts
```

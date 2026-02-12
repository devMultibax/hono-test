# User Module Migration Plan

## สถานะปัจจุบัน: วิเคราะห์แล้ว พร้อม refactor

---

## 1. สรุปปัญหา

### โครงสร้างปัจจุบัน (15 ไฟล์)

```
features/users/
├── index.ts                          # barrel export
├── types.ts                          # re-export types + local types
├── components/
│   ├── index.ts                      # barrel export
│   ├── UserForm.tsx                  # ฟอร์ม create/edit (reusable)
│   ├── UserFilterFields.tsx          # filter fields เปล่าๆ (4 selects)
│   ├── UserFilters.tsx               # wrapper ครอบ FilterFields + SearchInput
│   ├── UserExportDrawer.tsx          # wrapper ครอบ ExportDrawer + FilterFields
│   ├── UserCreateDrawer.tsx          # drawer สำหรับ create
│   ├── UserEditDrawer.tsx            # drawer สำหรับ edit
│   ├── UserDetailDrawer.tsx          # drawer สำหรับ view detail
│   ├── UserActionMenu.tsx            # ปุ่ม action ใน table row
│   └── ResetPasswordModal.tsx        # modal แสดงรหัสผ่านใหม่
├── hooks/
│   ├── useUsers.ts                   # React Query hooks (queries + mutations)
│   ├── useUserActions.ts             # action handlers (delete, status, bulk)
│   ├── useUserDrawer.ts              # drawer state management
│   ├── useUserColumns.tsx            # column definitions (มี JSX)
│   └── userTable.config.ts           # DEFAULT_PARAMS + SORT_FIELD_MAP
└── pages/
    ├── index.ts                      # barrel export
    └── UserListPage.tsx              # หน้าหลัก
```

### ปัญหาที่พบ

| # | ปัญหา | รายละเอียด |
|---|--------|-----------|
| 1 | **Drawer แยก 3 ไฟล์** | `UserCreateDrawer`, `UserEditDrawer`, `UserDetailDrawer` ทำหน้าที่คล้ายกัน แต่แยกไฟล์ ทำให้ต้อง track state 3 ที่ |
| 2 | **Filter แยก 2 ไฟล์** | `UserFilterFields` (4 selects) กับ `UserFilters` (wrapper + search) แยกกันโดยไม่จำเป็น — `UserFilterFields` ถูกใช้แค่ใน `UserFilters` และ `UserExportDrawer` |
| 3 | **Hook แยกย่อยเกินไป** | `useUserDrawer` (15 บรรทัด), `useUserActions` (72 บรรทัด), `userTable.config.ts` (11 บรรทัด) — ไฟล์เล็กเกินที่จะแยก |
| 4 | **useUserColumns เป็น hook** | ใน app เก่าเป็น config file (`userTableConfig.tsx`) ที่ชัดเจนกว่า — hook ที่ return JSX ดูสับสน |
| 5 | **barrel files ซ้ำซ้อน** | `components/index.ts`, `pages/index.ts`, `index.ts` — 3 barrel files สำหรับ module เดียว |
| 6 | **ResetPasswordModal แยกไฟล์** | ใช้แค่ใน `UserActionMenu` เท่านั้น ไม่มีที่อื่นใช้ |

### เปรียบเทียบกับ app เก่า (app-mantine-ts)

| หัวข้อ | app เก่า | app ใหม่ | ข้อสังเกต |
|--------|----------|----------|----------|
| จำนวนไฟล์ (user) | ~12 | ~15 | เก่าน้อยกว่า แต่มี service layer แยก |
| Drawer | ไม่มี (ใช้ page navigation) | 3 drawers แยก | เก่าง่ายกว่า แต่ drawer pattern ดีกว่า UX |
| Table config | `configs/userTableConfig.tsx` (config file) | `hooks/useUserColumns.tsx` (hook) | Config file ชัดเจนกว่า |
| Business logic | `hooks/useUserManage.ts` (รวมไว้ที่เดียว) | แยก `useUserActions` + `useUserDrawer` + `useUsers` | เก่ารวมเกินไป, ใหม่แยกเกินไป |
| Storage | `hooks/useUserManageStorage.ts` (แยก) | ผนวกเข้า `useDataTable` (shared hook) | ใหม่ดีกว่า ✓ |
| Service | `services/user.service.ts` (local) | `api/services/user.api.ts` (global) | ใหม่ดีกว่า ✓ |
| Types | `types/user.ts` (local + initial values) | `types.ts` (re-export + local types) | ใหม่ดีกว่า ✓ |

---

## 2. เป้าหมาย

> **ลดจำนวนไฟล์ จัดกลุ่มให้ชัดเจน โดยคงข้อดีของ pattern ใหม่ไว้**

### หลักการ
1. ไม่ถอยกลับไปใช้ pattern เก่าทั้งหมด — ข้อดีของ app ใหม่ (React Query, shared hooks, drawer UX) เก็บไว้
2. รวมไฟล์ที่เล็กเกินไปเข้าด้วยกัน
3. ไฟล์ที่ใช้ที่เดียว → inline หรือรวมเข้าไฟล์หลัก
4. Config ที่ไม่มี logic → เป็น config file ไม่ใช่ hook

---

## 3. โครงสร้างใหม่ (เป้าหมาย)

```
features/users/
├── index.ts                          # barrel export (เหมือนเดิม)
├── types.ts                          # types (เหมือนเดิม)
├── userTable.config.tsx              # ย้ายขึ้นมา root: columns + DEFAULT_PARAMS + SORT_FIELD_MAP
├── components/
│   ├── UserForm.tsx                  # ฟอร์ม create/edit (เหมือนเดิม)
│   ├── UserFilters.tsx               # รวม FilterFields เข้ามา
│   ├── UserDrawer.tsx                # รวม Create + Edit + Detail เป็นไฟล์เดียว
│   ├── UserExportDrawer.tsx          # เหมือนเดิม (inline FilterFields)
│   └── UserActionMenu.tsx            # รวม ResetPasswordModal เข้ามา
├── hooks/
│   └── useUsers.ts                   # รวม queries + mutations + actions ทั้งหมด
└── pages/
    └── UserListPage.tsx              # หน้าหลัก (ปรับ import)
```

**ผลลัพธ์: 15 ไฟล์ → 10 ไฟล์** (ลด 5 ไฟล์, ลด 3 barrel files)

---

## 4. รายละเอียดการเปลี่ยนแปลง

### 4.1 รวม Drawer → `UserDrawer.tsx`

**ลบ:** `UserCreateDrawer.tsx`, `UserEditDrawer.tsx`, `UserDetailDrawer.tsx`, `useUserDrawer.ts`
**สร้าง:** `components/UserDrawer.tsx`

```
// แนวทาง: ใช้ discriminated union (UserDrawerState ที่มีอยู่แล้ว)
// เป็น single component ที่ switch ตาม mode

UserDrawer
├── mode === 'create' → แสดง UserForm + credential modal
├── mode === 'edit'   → fetch user → แสดง UserForm
├── mode === 'detail' → fetch user → แสดง detail view
└── mode === 'closed' → ไม่แสดงอะไร
```

**เหตุผล:**
- Drawer state (`useUserDrawer`) มี 15 บรรทัด → inline เป็น `useState` ใน `UserListPage`
- Drawer 3 ตัวใช้ pattern เดียวกัน (opened/onClose/userId) → รวมเป็น single component
- ลดการส่ง prop `drawer.drawer.mode === 'xxx'` ที่ดูซ้ำซ้อนใน page

**โครงสร้างภายใน:**
```tsx
interface Props {
  state: UserDrawerState;
  onClose: () => void;
  onEdit: (userId: number) => void;
}

export function UserDrawer({ state, onClose, onEdit }: Props) {
  // Internal state สำหรับ credential modal (create mode)
  const opened = state.mode !== 'closed';
  const userId = 'userId' in state ? state.userId : 0;

  return (
    <DrawerForm opened={opened} onClose={onClose} title={...}>
      {state.mode === 'create' && <CreateContent onClose={onClose} />}
      {state.mode === 'edit' && <EditContent userId={userId} onClose={onClose} />}
      {state.mode === 'detail' && <DetailContent userId={userId} onEdit={onEdit} onClose={onClose} />}
    </DrawerForm>
  );
}

// Sub-components ภายในไฟล์เดียวกัน
function CreateContent(...) { ... }
function EditContent(...) { ... }
function DetailContent(...) { ... }
```

---

### 4.2 รวม Filter Fields → `UserFilters.tsx`

**ลบ:** `UserFilterFields.tsx`
**แก้ไข:** `UserFilters.tsx`, `UserExportDrawer.tsx`

**แนวทาง:**
- ย้ายเนื้อหา `UserFilterFields` (4 selects) เข้า `UserFilters.tsx` โดยตรง
- `UserExportDrawer.tsx` → inline 4 selects เอง (code ไม่เยอะ แค่ 4 `<Select>`)
- หรือ export function `renderFilterFields(values, onUpdate)` จาก `UserFilters.tsx` ให้ `UserExportDrawer` ใช้ร่วมได้

**ทางเลือก (แนะนำ):** เก็บ `UserFilterFields` เป็น local function ใน `UserFilters.tsx` แล้ว export ให้ `UserExportDrawer` ใช้

```tsx
// UserFilters.tsx
export function UserFilterFields({ values, onUpdate }: FilterFieldsProps) { ... }

export function UserFilters({ params, onChange }: Props) {
  // ... ใช้ UserFilterFields ภายใน
}
```

---

### 4.3 รวม Columns + Config → `userTable.config.tsx`

**ลบ:** `hooks/useUserColumns.tsx`, `hooks/userTable.config.ts`
**สร้าง:** `userTable.config.tsx` (ที่ root ของ feature)

**แนวทาง:**
- ย้าย `DEFAULT_PARAMS` + `SORT_FIELD_MAP` ขึ้นมา
- เปลี่ยน `useUserColumns` hook → `createUserColumns()` factory function (เหมือน pattern เก่า)
- ย้าย `t()` ออกจาก function — ให้ caller ส่ง `t` เข้ามา หรือใช้ i18n key string แทน

```tsx
// userTable.config.tsx
export const DEFAULT_PARAMS: UserQueryParams = { ... };
export const SORT_FIELD_MAP: Record<string, string> = { ... };

export function createUserColumns(options: UserColumnOptions): ColumnDef<User>[] {
  return [ ... ];
}
```

**หมายเหตุ:** ถ้าต้องใช้ `useTranslation` hook ข้างใน (เพราะ columns ต้อง reactive ต่อภาษา) → เก็บเป็น hook ได้ แต่ย้ายไปรวมกับ config

---

### 4.4 รวม Actions เข้า `useUsers.ts`

**ลบ:** `hooks/useUserActions.ts`
**แก้ไข:** `hooks/useUsers.ts`

**แนวทาง:**
- ย้าย `handleDelete`, `handleStatusChange`, `handleBulkDelete`, `handleImportSuccess` เข้า `useUsers.ts`
- Export เป็น `useUserActions()` จากไฟล์เดียวกัน
- ทำให้ `hooks/` เหลือไฟล์เดียว: `useUsers.ts` — ที่เดียวสำหรับ data layer ทั้งหมด

```tsx
// hooks/useUsers.ts

// === Query Keys ===
export const userKeys = createQueryKeys<UserQueryParams>('users');

// === Queries ===
export function useUsers(params) { ... }
export function useUser(id) { ... }

// === Mutations (from factory) ===
export { useUpdateUser, useDeleteUser, useBulkDeleteUsers };
export function useCreateUser() { ... }
export function useResetPassword() { ... }
export function useUpdateUserStatus() { ... }

// === Action Handlers (with confirm) ===
export function useUserActions() {
  // handleDelete, handleStatusChange, handleBulkDelete, handleImportSuccess
}
```

---

### 4.5 รวม ResetPasswordModal เข้า `UserActionMenu.tsx`

**ลบ:** `ResetPasswordModal.tsx`
**แก้ไข:** `UserActionMenu.tsx`

**เหตุผล:** `ResetPasswordModal` ถูกใช้เฉพาะใน `UserActionMenu` เท่านั้น (38 บรรทัด) → inline ได้เลย

---

### 4.6 ลบ barrel files ที่ไม่จำเป็น

**ลบ:** `components/index.ts`, `pages/index.ts`
**แก้ไข:** `index.ts` (root) ให้ import ตรงจากไฟล์

```tsx
// index.ts
export { UserListPage } from './pages/UserListPage';
export { useUsers, useUserActions, userKeys } from './hooks/useUsers';
export type { UserDrawerState, UserFormValues, UserExportParams } from './types';
```

---

## 5. ลำดับการดำเนินการ

| ลำดับ | งาน | ผลกระทบ | ความเสี่ยง |
|-------|------|---------|-----------|
| 1 | รวม `ResetPasswordModal` → `UserActionMenu` | ต่ำ | ต่ำ |
| 2 | รวม `UserFilterFields` → `UserFilters` + ปรับ `UserExportDrawer` | ต่ำ | ต่ำ |
| 3 | รวม columns + config → `userTable.config.tsx` | กลาง | ต่ำ |
| 4 | รวม `useUserActions` → `useUsers.ts` | กลาง | ต่ำ |
| 5 | รวม 3 Drawers → `UserDrawer.tsx` + ลบ `useUserDrawer` | สูง | กลาง (ซับซ้อนที่สุด) |
| 6 | ลบ barrel files + ปรับ imports | ต่ำ | ต่ำ |
| 7 | ปรับ `UserListPage.tsx` ตาม structure ใหม่ | กลาง | ต่ำ |

---

## 6. สรุปไฟล์ที่เปลี่ยนแปลง

### ไฟล์ที่ลบ (7 ไฟล์)
- `components/index.ts`
- `components/ResetPasswordModal.tsx`
- `components/UserFilterFields.tsx`
- `components/UserCreateDrawer.tsx`
- `components/UserEditDrawer.tsx`
- `components/UserDetailDrawer.tsx`
- `hooks/useUserActions.ts`
- `hooks/useUserDrawer.ts`
- `hooks/useUserColumns.tsx`
- `hooks/userTable.config.ts`
- `pages/index.ts`

### ไฟล์ที่สร้างใหม่ (2 ไฟล์)
- `components/UserDrawer.tsx` (รวม 3 drawers)
- `userTable.config.tsx` (รวม columns + config)

### ไฟล์ที่แก้ไข (5 ไฟล์)
- `components/UserActionMenu.tsx` (inline ResetPasswordModal)
- `components/UserFilters.tsx` (inline FilterFields)
- `components/UserExportDrawer.tsx` (ปรับ import FilterFields)
- `hooks/useUsers.ts` (รวม actions เข้ามา)
- `pages/UserListPage.tsx` (ปรับ imports + inline drawer state)
- `index.ts` (ปรับ exports)

---

## 7. สิ่งที่ไม่เปลี่ยน

- `types.ts` — โครงสร้าง type ดีอยู่แล้ว
- `components/UserForm.tsx` — reusable form ที่ดี เก็บไว้
- `hooks/useUsers.ts` — React Query pattern ดี เพิ่ม actions เข้าไป
- `api/services/user.api.ts` — global service ดีกว่า local service
- shared hooks (`useDataTable`, `useConfirm`, `createCrudHooks`) — ดีมาก ใช้ต่อ
- Drawer UX pattern — ดีกว่า page navigation ของ app เก่า

---

## 8. ข้อควรระวัง

1. **Test ทุก mode ของ Drawer** — create, edit, detail ต้องทำงานถูกต้องหลังรวม
2. **Credential modal (create mode)** — ต้องยังคง block close จนกว่า user จะ acknowledge
3. **React Query invalidation** — ตรวจสอบว่า cache invalidation ยังทำงานหลัง refactor
4. **i18n keys** — ไม่เปลี่ยน keys ใดๆ แค่ย้ายที่เรียก
5. **TypeScript types** — `UserDrawerState` discriminated union ยังใช้เหมือนเดิม

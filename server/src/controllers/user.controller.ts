import type { ExportColumn } from '../types/export'
import type { UserWithRelations } from '../types'

export const userExcelColumns: ExportColumn<UserWithRelations>[] = [
  { key: 'username', label: 'Username', width: 15 },
  { key: 'firstName', label: 'First Name', width: 20 },
  { key: 'lastName', label: 'Last Name', width: 20 },
  { key: 'department.name', label: 'Department', width: 25, value: (_, item) => item.department?.name || '' },
  { key: 'section.name', label: 'Section', width: 25, value: (_, item) => item.section?.name || '' },
  { key: 'email', label: 'Email', width: 30, value: (v) => (v as string) || '' },
  { key: 'tel', label: 'Phone', width: 15, value: (v) => (v as string) || '' },
  { key: 'role', label: 'Role', width: 12 },
  { key: 'status', label: 'Status', width: 12 },
  { key: 'lastLoginAt', label: 'Last Login', width: 20, value: (v) => v ? new Date(v as string).toLocaleString('th-TH') : '' }
]

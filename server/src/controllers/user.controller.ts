import type { ExportColumn } from '../types/export'
import type { UserWithRelations } from '../types'

// Excel columns
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

// PDF columns (landscape)
export const userPdfColumns: ExportColumn<UserWithRelations>[] = [
  { key: 'username', label: 'Username', width: 70 },
  { key: 'fullName', label: 'Name', width: 120, value: (_, item) => `${item.firstName} ${item.lastName}` },
  { key: 'department.name', label: 'Department', width: 100, value: (_, item) => item.department?.name || '' },
  { key: 'section.name', label: 'Section', width: 100, value: (_, item) => item.section?.name || '' },
  { key: 'email', label: 'Email', width: 140, value: (v) => (v as string) || '' },
  { key: 'role', label: 'Role', width: 60 },
  { key: 'status', label: 'Status', width: 60 }
]

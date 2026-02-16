import type { ExportColumn } from '../types/export'

// Value formatters
export const formatDate = (v: unknown) =>
  v ? new Date(v as string).toLocaleString('th-TH') : ''

export const formatOptionalString = (v: unknown) =>
  (v as string) || ''

export const mapValue = (map: Record<string, string>) =>
  (v: unknown) => map[v as string] || (v as string)

// Shared label maps
export const roleMap: Record<string, string> = {
  USER: 'ผู้ใช้',
  ADMIN: 'ผู้ดูแลระบบ'
}

export const statusMap: Record<string, string> = {
  active: 'ใช้งาน',
  inactive: 'ไม่ใช้งาน'
}

// Reusable audit columns (createdAt, createdByName, updatedAt, updatedByName)
export const auditColumns: ExportColumn[] = [
  { key: 'createdAt', label: 'วันที่สร้าง', width: 20, value: formatDate },
  { key: 'createdByName', label: 'สร้างโดย', width: 20, value: formatOptionalString },
  { key: 'updatedAt', label: 'วันที่แก้ไข', width: 20, value: formatDate },
  { key: 'updatedByName', label: 'แก้ไขโดย', width: 20, value: formatOptionalString }
]

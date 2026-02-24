import type { ExportColumn } from '../types/export'
import { MSG } from '../constants/messages'

// Filename timestamp: DDMMYY_HHmm  (e.g. 240226_1028)
export function exportTimestamp(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${dd}${mm}${yy}_${hh}${min}`
}

// Value formatters
export const formatDate = (v: unknown) =>
  v ? new Date(v as string).toLocaleString('th-TH') : ''

export const formatOptionalString = (v: unknown) =>
  (v as string) || ''

export const mapValue = (map: Record<string, string>) =>
  (v: unknown) => map[v as string] || (v as string)

// Shared label maps
export const roleMap: Record<string, string> = {
  USER: MSG.export.values.role.USER,
  ADMIN: MSG.export.values.role.ADMIN,
}

export const statusMap: Record<string, string> = {
  active: MSG.export.values.status.active,
  inactive: MSG.export.values.status.inactive,
}

// Reusable audit columns (createdAt, createdByName, updatedAt, updatedByName)
export const auditColumns: ExportColumn[] = [
  { key: 'createdAt', label: MSG.export.common.createdAt, width: 20, value: formatDate },
  { key: 'createdByName', label: MSG.export.common.createdBy, width: 20, value: formatOptionalString },
  { key: 'updatedAt', label: MSG.export.common.updatedAt, width: 20, value: formatDate },
  { key: 'updatedByName', label: MSG.export.common.updatedBy, width: 20, value: formatOptionalString }
]

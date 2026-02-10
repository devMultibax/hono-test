import type { ExportColumn } from '../types/export'
import type { UserWithRelations } from '../types'
import { formatDate, formatOptionalString, mapValue, roleMap, statusMap, auditColumns } from '../lib/export-helpers'

export const userExcelColumns: ExportColumn<UserWithRelations>[] = [
  { key: 'username', label: 'รหัสพนักงาน', width: 15 },
  { key: 'firstName', label: 'ชื่อ', width: 20 },
  { key: 'lastName', label: 'นามสกุล', width: 20 },
  { key: 'department.name', label: 'ฝ่าย', width: 25, value: (_, item) => item.department?.name || '' },
  { key: 'section.name', label: 'หน่วยงาน', width: 25, value: (_, item) => item.section?.name || '' },
  { key: 'email', label: 'อีเมล', width: 30, value: formatOptionalString },
  { key: 'tel', label: 'เบอร์โทร', width: 15, value: formatOptionalString },
  { key: 'role', label: 'สิทธิ์', width: 12, value: mapValue(roleMap) },
  { key: 'status', label: 'สถานะ', width: 12, value: mapValue(statusMap) },
  { key: 'lastLoginAt', label: 'เข้าสู่ระบบล่าสุด', width: 20, value: formatDate },
  ...auditColumns
]

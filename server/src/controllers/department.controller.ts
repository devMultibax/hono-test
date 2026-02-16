import type { ExportColumn } from '../types/export'
import type { DepartmentResponse } from '../types'
import { mapValue, statusMap, auditColumns } from '../lib/export-helpers'

export const departmentExcelColumns: ExportColumn<DepartmentResponse>[] = [
  { key: 'name', label: 'ชื่อฝ่าย', width: 30 },
  { key: 'status', label: 'สถานะ', width: 12, value: mapValue(statusMap) },
  ...auditColumns
]

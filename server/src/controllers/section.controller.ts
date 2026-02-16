import type { ExportColumn } from '../types/export'
import type { SectionWithRelations } from '../types'
import { mapValue, statusMap, auditColumns } from '../lib/export-helpers'

export const sectionExcelColumns: ExportColumn<SectionWithRelations>[] = [
  { key: 'department', label: 'ชื่อฝ่าย', width: 20, value: (_v, item) => item.department?.name ?? '' },
  { key: 'name', label: 'ชื่อหน่วยงาน', width: 30 },
  { key: 'status', label: 'สถานะ', width: 12, value: mapValue(statusMap) },
  ...auditColumns
]

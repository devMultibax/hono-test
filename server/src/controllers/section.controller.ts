import type { ExportColumn } from '../types/export'
import type { SectionResponse } from '../types'

export const sectionExcelColumns: ExportColumn<SectionResponse>[] = [
  { key: 'id', label: 'ID', width: 10 },
  { key: 'departmentId', label: 'Department ID', width: 15 },
  { key: 'name', label: 'Name', width: 30 },
  { key: 'status', label: 'Status', width: 12 },
  { key: 'createdAt', label: 'Created At', width: 20, value: (v) => new Date(v as string).toLocaleString('th-TH') },
  { key: 'updatedAt', label: 'Updated At', width: 20, value: (v) => v ? new Date(v as string).toLocaleString('th-TH') : '' }
]

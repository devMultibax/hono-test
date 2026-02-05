export interface ExportColumn<T = unknown> {
    label: string
    key: string
    width?: number
    value?: (value: unknown, item: T) => string | number | Date | null
    alignment?: 'left' | 'center' | 'right'
}

export interface ExcelExportOptions<T = unknown> {
    columns: ExportColumn<T>[]
}

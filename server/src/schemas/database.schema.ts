import { z } from 'zod'

export const tableStatSchema = z.object({
  tableName: z.string(),
  rowCount: z.number().int().nonnegative(),
  totalSize: z.string(),
  indexSize: z.string(),
  totalSizeBytes: z.number().int().nonnegative()
})

export const databaseStatisticsSchema = z.object({
  databaseName: z.string(),
  totalTables: z.number().int().nonnegative(),
  totalRows: z.number().int().nonnegative(),
  totalSize: z.string(),
  tables: z.array(tableStatSchema)
})

export const analyzeResultSchema = z.object({
  message: z.string(),
  analyzedTables: z.array(z.string()),
  timestamp: z.string()
})

export type TableStat = z.infer<typeof tableStatSchema>
export type DatabaseStatistics = z.infer<typeof databaseStatisticsSchema>
export type AnalyzeResult = z.infer<typeof analyzeResultSchema>

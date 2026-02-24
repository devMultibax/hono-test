import { prisma } from '../lib/prisma'
import { formatBytes } from '../utils/format.utils'
import type { DatabaseStatistics, TableStat, AnalyzeResult } from '../schemas/database.schema'

const MANAGED_TABLES = ['user', 'department', 'section', 'user_log'] as const

export class DatabaseService {
  static async getStatistics(): Promise<DatabaseStatistics> {
    const [databaseName, tableStats] = await Promise.all([
      this.getDatabaseName(),
      this.getTableStatistics()
    ])

    const totalRows = tableStats.reduce((sum, table) => sum + table.rowCount, 0)
    const totalSizeBytes = tableStats.reduce((sum, table) => sum + table.totalSizeBytes, 0)

    return {
      databaseName,
      totalTables: tableStats.length,
      totalRows,
      totalSize: formatBytes(totalSizeBytes),
      tables: tableStats
    }
  }

  static async analyze(): Promise<AnalyzeResult> {
    const analyzedTables: string[] = []

    for (const table of MANAGED_TABLES) {
      await prisma.$executeRawUnsafe(`ANALYZE "${table}"`)
      analyzedTables.push(table)
    }

    return {
      message: 'Database analysis completed successfully',
      analyzedTables,
      timestamp: new Date().toISOString()
    }
  }

  private static async getDatabaseName(): Promise<string> {
    const result = await prisma.$queryRaw<Array<{ current_database: string }>>`
      SELECT current_database()
    `
    return result[0]?.current_database ?? 'unknown'
  }

  private static async getTableStatistics(): Promise<TableStat[]> {
    const statsPromises = MANAGED_TABLES.map(async (tableName) => {
      const [rowCount, sizes] = await Promise.all([
        this.getTableRowCount(tableName),
        this.getTableSize(tableName)
      ])

      return {
        tableName,
        rowCount,
        totalSize: sizes.totalSize,
        indexSize: sizes.indexSize,
        totalSizeBytes: sizes.totalSizeBytes
      }
    })

    const stats = await Promise.all(statsPromises)
    return stats.sort((a, b) => b.totalSizeBytes - a.totalSizeBytes)
  }

  private static async getTableRowCount(tableName: string): Promise<number> {
    const result = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) as count FROM "${tableName}"`
    )
    return Number(result[0]?.count ?? 0)
  }

  private static async getTableSize(tableName: string): Promise<{
    totalSize: string
    indexSize: string
    totalSizeBytes: number
  }> {
    const result = await prisma.$queryRawUnsafe<
      Array<{
        total_size: string
        index_size: string
        total_bytes: bigint
      }>
    >(
      `SELECT
        pg_size_pretty(pg_total_relation_size('"${tableName}"'::regclass)) as total_size,
        pg_size_pretty(pg_indexes_size('"${tableName}"'::regclass)) as index_size,
        pg_total_relation_size('"${tableName}"'::regclass) as total_bytes`
    )

    return {
      totalSize: result[0]?.total_size ?? '0 bytes',
      indexSize: result[0]?.index_size ?? '0 bytes',
      totalSizeBytes: Number(result[0]?.total_bytes ?? 0)
    }
  }

}

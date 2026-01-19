import ExcelJS from 'exceljs'
import { PassThrough } from 'stream'
import type { UserWithRelations } from '../types'
import type { DepartmentResponse } from '../types'
import type { SectionResponse } from '../types'

const MAX_ROWS_NORMAL = 10000
const MAX_ROWS_STREAMING = 50000
const MAX_ROWS_LIMIT = 50000

export class ExportService {
  /**
   * Export users to Excel with automatic strategy selection based on data size
   */
  static async exportUsersToExcel(
    users: UserWithRelations[],
    totalCount: number
  ): Promise<ExcelJS.Workbook | PassThrough> {
    if (totalCount > MAX_ROWS_LIMIT) {
      throw new Error(
        `Export limited to ${MAX_ROWS_LIMIT} rows. Please apply filters to reduce the dataset.`
      )
    }

    if (totalCount <= MAX_ROWS_NORMAL) {
      return this.exportUsersNormal(users)
    } else {
      return this.exportUsersStreaming(users)
    }
  }

  /**
   * Normal export strategy for small datasets (< 10k rows)
   */
  private static async exportUsersNormal(users: UserWithRelations[]): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Users')

    worksheet.columns = [
      { header: 'Username', key: 'username', width: 12 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Section', key: 'section', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'tel', width: 15 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Last Login', key: 'lastLoginAt', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    users.forEach((user) => {
      worksheet.addRow({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department?.name || '',
        section: user.section?.name || '',
        email: user.email || '',
        tel: user.tel || '',
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleString('th-TH')
          : ''
      })
    })

    return workbook
  }

  /**
   * Streaming export strategy for large datasets (10k-50k rows)
   */
  private static async exportUsersStreaming(users: UserWithRelations[]): Promise<PassThrough> {
    const stream = new PassThrough()

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: stream,
      useStyles: true,
      useSharedStrings: true
    })

    const worksheet = workbook.addWorksheet('Users')

    worksheet.columns = [
      { header: 'Username', key: 'username', width: 12 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Section', key: 'section', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'tel', width: 15 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Last Login', key: 'lastLoginAt', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    worksheet.getRow(1).commit()

    for (const user of users) {
      worksheet
        .addRow({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          department: user.department?.name || '',
          section: user.section?.name || '',
          email: user.email || '',
          tel: user.tel || '',
          role: user.role,
          status: user.status,
          lastLoginAt: user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleString('th-TH')
            : ''
        })
        .commit()
    }

    await worksheet.commit()
    await workbook.commit()

    return stream
  }

  /**
   * Export departments to Excel with automatic strategy selection
   */
  static async exportDepartmentsToExcel(
    departments: DepartmentResponse[],
    totalCount: number
  ): Promise<ExcelJS.Workbook | PassThrough> {
    if (totalCount > MAX_ROWS_LIMIT) {
      throw new Error(
        `Export limited to ${MAX_ROWS_LIMIT} rows. Please apply filters to reduce the dataset.`
      )
    }

    if (totalCount <= MAX_ROWS_NORMAL) {
      return this.exportDepartmentsNormal(departments)
    } else {
      return this.exportDepartmentsStreaming(departments)
    }
  }

  /**
   * Normal export strategy for departments
   */
  private static async exportDepartmentsNormal(
    departments: DepartmentResponse[]
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Departments')

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    departments.forEach((dept) => {
      worksheet.addRow({
        id: dept.id,
        name: dept.name,
        status: dept.status,
        createdAt: new Date(dept.createdAt).toLocaleString('th-TH'),
        updatedAt: dept.updatedAt
          ? new Date(dept.updatedAt).toLocaleString('th-TH')
          : ''
      })
    })

    return workbook
  }

  /**
   * Streaming export strategy for departments
   */
  private static async exportDepartmentsStreaming(
    departments: DepartmentResponse[]
  ): Promise<PassThrough> {
    const stream = new PassThrough()

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: stream,
      useStyles: true,
      useSharedStrings: true
    })

    const worksheet = workbook.addWorksheet('Departments')

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    worksheet.getRow(1).commit()

    for (const dept of departments) {
      worksheet
        .addRow({
          id: dept.id,
          name: dept.name,
          status: dept.status,
          createdAt: new Date(dept.createdAt).toLocaleString('th-TH'),
          updatedAt: dept.updatedAt
            ? new Date(dept.updatedAt).toLocaleString('th-TH')
            : ''
        })
        .commit()
    }

    await worksheet.commit()
    await workbook.commit()

    return stream
  }

  /**
   * Export sections to Excel with automatic strategy selection
   */
  static async exportSectionsToExcel(
    sections: SectionResponse[],
    totalCount: number
  ): Promise<ExcelJS.Workbook | PassThrough> {
    if (totalCount > MAX_ROWS_LIMIT) {
      throw new Error(
        `Export limited to ${MAX_ROWS_LIMIT} rows. Please apply filters to reduce the dataset.`
      )
    }

    if (totalCount <= MAX_ROWS_NORMAL) {
      return this.exportSectionsNormal(sections)
    } else {
      return this.exportSectionsStreaming(sections)
    }
  }

  /**
   * Normal export strategy for sections
   */
  private static async exportSectionsNormal(
    sections: SectionResponse[]
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sections')

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Department ID', key: 'departmentId', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    sections.forEach((section) => {
      worksheet.addRow({
        id: section.id,
        departmentId: section.departmentId,
        name: section.name,
        status: section.status,
        createdAt: new Date(section.createdAt).toLocaleString('th-TH'),
        updatedAt: section.updatedAt
          ? new Date(section.updatedAt).toLocaleString('th-TH')
          : ''
      })
    })

    return workbook
  }

  /**
   * Streaming export strategy for sections
   */
  private static async exportSectionsStreaming(sections: SectionResponse[]): Promise<PassThrough> {
    const stream = new PassThrough()

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: stream,
      useStyles: true,
      useSharedStrings: true
    })

    const worksheet = workbook.addWorksheet('Sections')

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Department ID', key: 'departmentId', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    worksheet.getRow(1).commit()

    for (const section of sections) {
      worksheet
        .addRow({
          id: section.id,
          departmentId: section.departmentId,
          name: section.name,
          status: section.status,
          createdAt: new Date(section.createdAt).toLocaleString('th-TH'),
          updatedAt: section.updatedAt
            ? new Date(section.updatedAt).toLocaleString('th-TH')
            : ''
        })
        .commit()
    }

    await worksheet.commit()
    await workbook.commit()

    return stream
  }

  /**
   * Check if the result is a stream or workbook
   */
  static isStream(result: ExcelJS.Workbook | PassThrough): result is PassThrough {
    return result instanceof PassThrough
  }
}

import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
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

  /**
   * Export users to PDF
   */
  static async exportUsersToPDF(users: UserWithRelations[]): Promise<PassThrough> {
    const stream = new PassThrough()
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' })

    doc.pipe(stream)

    doc.fontSize(16).text('User Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('th-TH')}`, { align: 'center' })
    doc.moveDown(2)

    const tableTop = 120
    const itemHeight = 20
    const headers = [
      { label: 'Username', x: 50, width: 70 },
      { label: 'Name', x: 120, width: 120 },
      { label: 'Department', x: 240, width: 100 },
      { label: 'Section', x: 340, width: 100 },
      { label: 'Email', x: 440, width: 140 },
      { label: 'Role', x: 580, width: 60 },
      { label: 'Status', x: 640, width: 60 }
    ]

    doc.fontSize(10).fillColor('#000000')
    headers.forEach((header) => {
      doc.rect(header.x, tableTop, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
      doc.fillColor('#000000').text(header.label, header.x + 5, tableTop + 5, {
        width: header.width - 10,
        align: 'left'
      })
    })

    let yPosition = tableTop + itemHeight

    users.forEach((user, index) => {
      if (yPosition > 500) {
        doc.addPage({ margin: 50, size: 'A4', layout: 'landscape' })
        yPosition = 50

        headers.forEach((header) => {
          doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
          doc.fillColor('#000000').text(header.label, header.x + 5, yPosition + 5, {
            width: header.width - 10,
            align: 'left'
          })
        })
        yPosition += itemHeight
      }

      const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F5F5F5'
      headers.forEach((header) => {
        doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke(fillColor, '#CCCCCC')
      })

      doc.fillColor('#000000').fontSize(8)
      doc.text(user.username, headers[0].x + 5, yPosition + 5, { width: headers[0].width - 10 })
      doc.text(
        `${user.firstName} ${user.lastName}`,
        headers[1].x + 5,
        yPosition + 5,
        { width: headers[1].width - 10 }
      )
      doc.text(user.department?.name || '', headers[2].x + 5, yPosition + 5, {
        width: headers[2].width - 10
      })
      doc.text(user.section?.name || '', headers[3].x + 5, yPosition + 5, {
        width: headers[3].width - 10
      })
      doc.text(user.email || '', headers[4].x + 5, yPosition + 5, { width: headers[4].width - 10 })
      doc.text(user.role, headers[5].x + 5, yPosition + 5, { width: headers[5].width - 10 })
      doc.text(user.status, headers[6].x + 5, yPosition + 5, { width: headers[6].width - 10 })

      yPosition += itemHeight
    })

    doc.end()
    return stream
  }

  /**
   * Export departments to PDF
   */
  static async exportDepartmentsToPDF(departments: DepartmentResponse[]): Promise<PassThrough> {
    const stream = new PassThrough()
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    doc.pipe(stream)

    doc.fontSize(16).text('Department Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('th-TH')}`, { align: 'center' })
    doc.moveDown(2)

    const tableTop = 120
    const itemHeight = 20
    const headers = [
      { label: 'ID', x: 50, width: 50 },
      { label: 'Name', x: 100, width: 200 },
      { label: 'Status', x: 300, width: 80 },
      { label: 'Created At', x: 380, width: 100 }
    ]

    doc.fontSize(10).fillColor('#000000')
    headers.forEach((header) => {
      doc.rect(header.x, tableTop, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
      doc.fillColor('#000000').text(header.label, header.x + 5, tableTop + 5, {
        width: header.width - 10,
        align: 'left'
      })
    })

    let yPosition = tableTop + itemHeight

    departments.forEach((dept, index) => {
      if (yPosition > 700) {
        doc.addPage({ margin: 50, size: 'A4' })
        yPosition = 50

        headers.forEach((header) => {
          doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
          doc.fillColor('#000000').text(header.label, header.x + 5, yPosition + 5, {
            width: header.width - 10,
            align: 'left'
          })
        })
        yPosition += itemHeight
      }

      const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F5F5F5'
      headers.forEach((header) => {
        doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke(fillColor, '#CCCCCC')
      })

      doc.fillColor('#000000').fontSize(9)
      doc.text(dept.id.toString(), headers[0].x + 5, yPosition + 5, {
        width: headers[0].width - 10
      })
      doc.text(dept.name, headers[1].x + 5, yPosition + 5, { width: headers[1].width - 10 })
      doc.text(dept.status, headers[2].x + 5, yPosition + 5, { width: headers[2].width - 10 })
      doc.text(new Date(dept.createdAt).toLocaleString('th-TH'), headers[3].x + 5, yPosition + 5, {
        width: headers[3].width - 10
      })

      yPosition += itemHeight
    })

    doc.end()
    return stream
  }

  /**
   * Export sections to PDF
   */
  static async exportSectionsToPDF(sections: SectionResponse[]): Promise<PassThrough> {
    const stream = new PassThrough()
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    doc.pipe(stream)

    doc.fontSize(16).text('Section Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('th-TH')}`, { align: 'center' })
    doc.moveDown(2)

    const tableTop = 120
    const itemHeight = 20
    const headers = [
      { label: 'ID', x: 50, width: 50 },
      { label: 'Dept ID', x: 100, width: 60 },
      { label: 'Name', x: 160, width: 180 },
      { label: 'Status', x: 340, width: 80 },
      { label: 'Created At', x: 420, width: 100 }
    ]

    doc.fontSize(10).fillColor('#000000')
    headers.forEach((header) => {
      doc.rect(header.x, tableTop, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
      doc.fillColor('#000000').text(header.label, header.x + 5, tableTop + 5, {
        width: header.width - 10,
        align: 'left'
      })
    })

    let yPosition = tableTop + itemHeight

    sections.forEach((section, index) => {
      if (yPosition > 700) {
        doc.addPage({ margin: 50, size: 'A4' })
        yPosition = 50

        headers.forEach((header) => {
          doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke('#E0E0E0', '#000000')
          doc.fillColor('#000000').text(header.label, header.x + 5, yPosition + 5, {
            width: header.width - 10,
            align: 'left'
          })
        })
        yPosition += itemHeight
      }

      const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F5F5F5'
      headers.forEach((header) => {
        doc.rect(header.x, yPosition, header.width, itemHeight).fillAndStroke(fillColor, '#CCCCCC')
      })

      doc.fillColor('#000000').fontSize(9)
      doc.text(section.id.toString(), headers[0].x + 5, yPosition + 5, {
        width: headers[0].width - 10
      })
      doc.text(section.departmentId.toString(), headers[1].x + 5, yPosition + 5, {
        width: headers[1].width - 10
      })
      doc.text(section.name, headers[2].x + 5, yPosition + 5, { width: headers[2].width - 10 })
      doc.text(section.status, headers[3].x + 5, yPosition + 5, { width: headers[3].width - 10 })
      doc.text(
        new Date(section.createdAt).toLocaleString('th-TH'),
        headers[4].x + 5,
        yPosition + 5,
        { width: headers[4].width - 10 }
      )

      yPosition += itemHeight
    })

    doc.end()
    return stream
  }
}

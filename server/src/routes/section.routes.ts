import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { csrfProtection } from '../middleware/csrf'
import { requireAdmin } from '../middleware/permission'
import { SectionService } from '../services/section.service'
import { createSectionSchema, updateSectionSchema, listSectionsQuerySchema } from '../schemas/section'
import { successResponse, createdResponse, noContentResponse } from '../lib/response'
import type { HonoContext, SectionResponse } from '../types'
import { ExportService } from '../services/export.service'
import { stream } from 'hono/streaming'

const sections = new Hono<HonoContext>()

sections.use('/*', authMiddleware)
sections.use('/*', csrfProtection)

sections.get('/', async (c) => {
  const include = c.req.query('include') === 'true'
  const queryParams = listSectionsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
    status: c.req.query('status')
  })

  const pagination = {
    page: queryParams.page,
    limit: queryParams.limit,
    sort: queryParams.sort,
    order: queryParams.order
  }

  const filters = {
    search: queryParams.search,
    departmentId: queryParams.departmentId,
    status: queryParams.status
  }

  const sectionList = await SectionService.getAll(include, pagination, filters)
  return successResponse(c, sectionList)
})

sections.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  const include = c.req.query('include') === 'true'
  const section = await SectionService.getById(id, include)
  return successResponse(c, section)
})

sections.post('/', requireAdmin, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const validated = createSectionSchema.parse(body)

  const section = await SectionService.create(
    validated.departmentId,
    validated.name,
    user.username
  )
  return createdResponse(c, section)
})

sections.put('/:id', requireAdmin, async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  const body = await c.req.json()
  const validated = updateSectionSchema.parse(body)

  const section = await SectionService.update(id, validated, user.username)
  return successResponse(c, section)
})

sections.delete('/:id', requireAdmin, async (c) => {
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid section ID' }, 400)
  }

  await SectionService.delete(id)
  return noContentResponse(c)
})

sections.get('/export/excel', async (c) => {
  const queryParams = listSectionsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
    status: c.req.query('status')
  })

  const filters = {
    search: queryParams.search,
    departmentId: queryParams.departmentId,
    status: queryParams.status
  }

  const sectionList = await SectionService.getAll(false, undefined, filters)
  const sections = Array.isArray(sectionList) ? sectionList : []
  const totalCount = sections.length

  const result = await ExportService.exportSectionsToExcel(
    sections as SectionResponse[],
    totalCount
  )

  const filename = `sections_${new Date().toISOString().split('T')[0]}.xlsx`

  if (ExportService.isStream(result)) {
    return stream(c, async (stream) => {
      c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      c.header('Content-Disposition', `attachment; filename="${filename}"`)

      result.on('data', (chunk) => {
        stream.write(chunk)
      })

      return new Promise((resolve, reject) => {
        result.on('end', () => {
          stream.close()
          resolve()
        })
        result.on('error', reject)
      })
    })
  } else {
    const buffer = await result.xlsx.writeBuffer()
    c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    c.header('Content-Disposition', `attachment; filename="${filename}"`)
    return c.body(buffer)
  }
})

sections.get('/export/pdf', async (c) => {
  const queryParams = listSectionsQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    sort: c.req.query('sort'),
    order: c.req.query('order'),
    search: c.req.query('search'),
    departmentId: c.req.query('departmentId'),
    status: c.req.query('status')
  })

  const filters = {
    search: queryParams.search,
    departmentId: queryParams.departmentId,
    status: queryParams.status
  }

  const sectionList = await SectionService.getAll(false, undefined, filters)
  const sections = Array.isArray(sectionList) ? sectionList : []

  const pdfStream = await ExportService.exportSectionsToPDF(sections as SectionResponse[])
  const filename = `sections_${new Date().toISOString().split('T')[0]}.pdf`

  return stream(c, async (stream) => {
    c.header('Content-Type', 'application/pdf')
    c.header('Content-Disposition', `attachment; filename="${filename}"`)

    pdfStream.on('data', (chunk) => {
      stream.write(chunk)
    })

    return new Promise((resolve, reject) => {
      pdfStream.on('end', () => {
        stream.close()
        resolve()
      })
      pdfStream.on('error', reject)
    })
  })
})

export default sections

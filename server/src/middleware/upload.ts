import type { Context, Next } from 'hono'
import type { HonoContext } from '../types'
import { FileValidatorUtils } from '../utils/file-validator.utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel' // .xls
]

export interface UploadedFile {
  filename: string
  mimeType: string
  size: number
  buffer: Buffer
}

/**
 * Parse multipart/form-data and extract file
 */
export async function parseUpload(c: Context<HonoContext>): Promise<UploadedFile | null> {
  const contentType = c.req.header('content-type')

  if (!contentType || !contentType.includes('multipart/form-data')) {
    return null
  }

  try {
    const body = await c.req.parseBody()
    const file = body.file

    if (!file || typeof file === 'string') {
      return null
    }

    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer())

      return {
        filename: file.name,
        mimeType: file.type,
        size: buffer.length,
        buffer
      }
    }

    return null
  } catch (error) {
    console.error('File upload parsing error:', error)
    return null
  }
}

/**
 * Validate uploaded file
 */
export function validateFile(file: UploadedFile): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed'
    }
  }

  if (!file.filename.match(/\.(xlsx|xls)$/i)) {
    return {
      valid: false,
      error: 'Invalid file extension. Only .xlsx and .xls files are allowed'
    }
  }

  if (!FileValidatorUtils.validateMimeType(file.buffer, file.mimeType)) {
    return {
      valid: false,
      error: 'File content does not match its declared type. The file may be corrupted or disguised.'
    }
  }

  return { valid: true }
}

/**
 * Middleware to handle file upload
 */
export async function uploadMiddleware(c: Context<HonoContext>, next: Next) {
  const file = await parseUpload(c)

  if (!file) {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    return c.json({ error: validation.error }, 400)
  }

  c.set('uploadedFile' as any, file)

  await next()
}

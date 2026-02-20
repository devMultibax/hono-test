import type { Context } from 'hono'
import { parseUpload, validateFile, type UploadedFile } from '../middleware/upload'
import { ValidationError } from '../lib/errors'
import { CODES } from '../constants/error-codes'
import type { HonoContext } from '../types'

/**
 * Parses the multipart upload and validates the file in one step.
 *
 * Throws a `ValidationError` (handled by the global error handler) if:
 * - No file is present in the request
 * - The file fails MIME-type / size / extension validation
 *
 * Reduces the ~10-line boilerplate that was duplicated in every import route.
 *
 * @example
 * // Before (in every import route)
 * const file = await parseUpload(c)
 * if (!file) return c.json({ error: CODES.USER_NO_FILE_UPLOADED }, 400)
 * const validation = validateFile(file)
 * if (!validation.valid) return c.json({ error: validation.error }, 400)
 *
 * // After
 * const file = await resolveUploadedFile(c)
 */
export async function resolveUploadedFile(c: Context<HonoContext>): Promise<UploadedFile> {
  const file = await parseUpload(c)

  if (!file) {
    throw new ValidationError(CODES.USER_NO_FILE_UPLOADED)
  }

  const validation = validateFile(file)

  if (!validation.valid) {
    throw new ValidationError(validation.error!)
  }

  return file
}

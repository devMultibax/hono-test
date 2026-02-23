export interface FileValidationOptions {
  maxSize?: number
  allowedMimeTypes?: string[]
  allowedExtensions?: string[]
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export class FileValidatorUtils {
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024

  private static readonly ALLOWED_MIME_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    excel: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
  }

  private static readonly MAGIC_NUMBERS: Record<string, number[]> = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'application/pdf': [0x25, 0x50, 0x44, 0x46],
    'application/zip': [0x50, 0x4b, 0x03, 0x04],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4b, 0x03, 0x04],
    'application/vnd.ms-excel': [0xd0, 0xcf, 0x11, 0xe0] // Compound Document Binary Format (.xls)
  }

  static validateFile(
    file: File | Buffer,
    options: FileValidationOptions = {}
  ): FileValidationResult {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE
    const allowedMimeTypes = options.allowedMimeTypes
    const allowedExtensions = options.allowedExtensions

    if (file instanceof File) {
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
        }
      }

      if (allowedMimeTypes && !allowedMimeTypes.includes(file.type)) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed`
        }
      }

      if (allowedExtensions) {
        const extension = this.getFileExtension(file.name)
        if (!allowedExtensions.includes(extension)) {
          return {
            valid: false,
            error: `File extension ${extension} is not allowed`
          }
        }
      }
    } else {
      if (file.length > maxSize) {
        return {
          valid: false,
          error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`
        }
      }
    }

    return { valid: true }
  }

  static validateMimeType(buffer: Buffer, expectedMimeType: string): boolean {
    const magicNumbers = this.MAGIC_NUMBERS[expectedMimeType]

    if (!magicNumbers) {
      return true
    }

    for (let i = 0; i < magicNumbers.length; i++) {
      if (buffer[i] !== magicNumbers[i]) {
        return false
      }
    }

    return true
  }

  static getFileExtension(filename: string): string {
    const parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  static isImageFile(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.images.includes(mimeType)
  }

  static isDocumentFile(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.documents.includes(mimeType)
  }

  static isExcelFile(mimeType: string): boolean {
    return this.ALLOWED_MIME_TYPES.excel.includes(mimeType)
  }

  static getAllowedMimeTypes(category: 'images' | 'documents' | 'excel'): string[] {
    return this.ALLOWED_MIME_TYPES[category]
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/^\./, '')
      .substring(0, 255)
  }

  static generateUniqueFilename(originalFilename: string): string {
    const extension = this.getFileExtension(originalFilename)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `${timestamp}_${random}${extension ? '.' + extension : ''}`
  }
}

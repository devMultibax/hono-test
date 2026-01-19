export class SanitizeUtils {
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:/gi,
    /data:text\/html/gi
  ]

  static escapeHtml(text: string): string {
    if (!text || typeof text !== 'string') {
      return ''
    }

    return text.replace(/[&<>"'\/]/g, (char) => {
      return this.HTML_ENTITIES[char] || char
    })
  }

  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    let sanitized = input.trim()

    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }

    return sanitized
  }

  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = this.sanitizeInput(value) as T[keyof T]
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key as keyof T] = this.sanitizeObject(value) as T[keyof T]
      } else if (Array.isArray(value)) {
        sanitized[key as keyof T] = value.map((item) =>
          typeof item === 'string' ? this.sanitizeInput(item) : item
        ) as T[keyof T]
      } else {
        sanitized[key as keyof T] = value
      }
    }

    return sanitized
  }

  static stripTags(html: string): string {
    if (!html || typeof html !== 'string') {
      return ''
    }

    return html.replace(/<[^>]*>/g, '')
  }

  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
      return false
    }

    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return ''
    }

    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255)
  }

  static preventPathTraversal(path: string): string {
    if (!path || typeof path !== 'string') {
      return ''
    }

    return path
      .replace(/\.\./g, '')
      .replace(/[\/\\]{2,}/g, '/')
      .replace(/^[\/\\]/, '')
  }
}

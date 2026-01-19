import crypto from 'crypto'

export class CsrfUtils {
  private static readonly SECRET_LENGTH = 32
  private static readonly TOKEN_LENGTH = 64

  static generateSecret(): string {
    return crypto.randomBytes(this.SECRET_LENGTH).toString('hex')
  }

  static generateToken(secret: string): string {
    const randomValue = crypto.randomBytes(this.TOKEN_LENGTH / 2).toString('hex')
    const hash = crypto
      .createHmac('sha256', secret)
      .update(randomValue)
      .digest('hex')

    return `${randomValue}.${hash}`
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      const [randomValue, hash] = token.split('.')

      if (!randomValue || !hash) {
        return false
      }

      const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(randomValue)
        .digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      )
    } catch {
      return false
    }
  }
}

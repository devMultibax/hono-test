import type { Context, Next } from 'hono'

/**
 * CSP directives for API documentation pages
 * Allows CDN resources required by Scalar/Swagger UI
 */
const CSP_DOCS = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')

/**
 * Strict CSP directives for API endpoints
 */
const CSP_STRICT = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')

/**
 * Paths that require relaxed CSP for documentation rendering
 */
const DOCS_PATHS = ['/docs', '/api-docs', '/swagger']

/**
 * Security headers middleware
 * Applies strict security headers with relaxed CSP for documentation pages
 */
export const securityHeaders = async (c: Context, next: Next) => {
  const isDocsPage = DOCS_PATHS.some(path => c.req.path.startsWith(path))

  // Set common security headers
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  // Set CSP based on path
  c.header('Content-Security-Policy', isDocsPage ? CSP_DOCS : CSP_STRICT)

  await next()
}

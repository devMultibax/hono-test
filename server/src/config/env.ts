import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z
    .string({ message: 'DATABASE_URL is required' })
    .min(1, 'DATABASE_URL cannot be empty')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
        } catch {
          return false;
        }
      },
      'DATABASE_URL must be a valid PostgreSQL connection string'
    ),

  JWT_SECRET: z
    .string({ message: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .max(256, 'JWT_SECRET must not exceed 256 characters'),

  JWT_COOKIE_NAME: z
    .string()
    .min(1, 'JWT_COOKIE_NAME must not be empty')
    .max(50, 'JWT_COOKIE_NAME must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'JWT_COOKIE_NAME must only contain alphanumeric characters, hyphens, and underscores')
    .default('auth_token'),

  JWT_COOKIE_MAX_AGE: z
    .string()
    .regex(/^\d+$/, 'JWT_COOKIE_MAX_AGE must be a number')
    .default('86400000')
    .transform(Number)
    .refine((val) => val > 0 && val <= 31536000000, 'JWT_COOKIE_MAX_AGE must be between 1 and 31536000000 (1 year)'),

  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default(false),

  COOKIE_SAME_SITE: z
    .enum(['strict', 'lax', 'none'])
    .default('lax'),

  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .default('3000')
    .transform(Number)
    .refine((port) => port >= 1 && port <= 65535, 'PORT must be between 1 and 65535'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  ALLOW_ORIGINS: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return [];
      return val.split(',').map(origin => origin.trim());
    })
    .describe('Comma-separated list of allowed origins for CORS (e.g., https://example.com,https://app.example.com)'),

  PG_BIN_PATH: z
    .string()
    .optional()
    .describe('Path to PostgreSQL bin directory (e.g., C:\\Program Files\\PostgreSQL\\16\\bin)')
});

function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);

    if (parsed.NODE_ENV === 'production') {
      if (!parsed.COOKIE_SECURE) {
        console.warn('⚠️  WARNING: COOKIE_SECURE is disabled in production environment. This is insecure!');
      }
      if (parsed.COOKIE_SAME_SITE === 'none') {
        console.warn('⚠️  WARNING: COOKIE_SAME_SITE is set to "none" in production. Ensure COOKIE_SECURE is enabled.');
      }
      if (parsed.ALLOW_ORIGINS.length === 0) {
        console.warn('⚠️  WARNING: ALLOW_ORIGINS is not set in production. CORS will block all cross-origin requests!');
      }
    }

    console.log('✅ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    } else {
      console.error('❌ Unexpected error during environment validation:', error);
    }
    process.exit(1);
  }
}

export const env = validateEnv();

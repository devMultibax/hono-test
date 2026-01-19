import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_COOKIE_NAME: z.string().default('auth_token'),
  JWT_COOKIE_MAX_AGE: z.string().default('86400000'),
  COOKIE_SECURE: z.string().optional().transform(val => val === 'true').default(false),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation error:', error);
    throw new Error('Invalid environment variables');
  }
}

export const env = validateEnv();

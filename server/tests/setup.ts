import { vi, afterEach, afterAll } from 'vitest'

vi.mock('../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: '3000',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-key-for-testing-purposes-only',
    JWT_COOKIE_NAME: 'auth_token',
    JWT_COOKIE_MAX_AGE: 86400000,
    COOKIE_SECURE: false,
    COOKIE_SAME_SITE: 'Lax',
    CORS_ORIGIN: 'http://localhost:3000',
    BACKUP_ENABLED: false,
    BACKUP_CRON: '0 2 * * *',
    BACKUP_DIR: './storage/backups',
    LOG_ROTATION_ENABLED: false,
    LOG_RETENTION_DAYS: 30,
    LOG_DIR: './storage/logs'
  }
}))

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
})

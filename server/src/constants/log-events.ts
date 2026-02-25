// Centralized log event message templates.
// Format: [DOMAIN] Action entity "identifier" — detail
//
// Rules:
//   - Past-tense verb for completed actions (Created, Updated, Deleted, Restored…)
//   - "Started" for process initiation
//   - "Failed to <infinitive>" for failures
//   - Identifier always in double-quotes when available
//   - Extra context after em-dash (—)
//   - Technical details (error.message, stderr) go in the separate `detail` field, never in the event string

export const LogEvent = {
  // ─── AUTH ─────────────────────────────────────────────────────────────────
  AUTH_LOGGED_IN: '[AUTH] Logged in',
  AUTH_LOGGED_OUT: '[AUTH] Logged out',
  AUTH_SESSION_REPLACED: '[AUTH] Replaced active session — new login from another device',
  AUTH_LOGIN_FAILED: '[AUTH] Failed to log in',

  // ─── USER ─────────────────────────────────────────────────────────────────
  USER_CREATED: (username: string) => `[USER] Created user "${username}"`,
  USER_UPDATED: (username: string) => `[USER] Updated user "${username}"`,
  USER_DELETED: (username: string) => `[USER] Deleted user "${username}"`,
  USER_PASSWORD_RESET: (username: string) => `[USER] Reset password for user "${username}"`,
  USER_IMPORTED: (succeeded: number, failed: number) => `[USER] Imported users — ${succeeded} succeeded, ${failed} failed`,

  // ─── DEPARTMENT ───────────────────────────────────────────────────────────
  DEPT_CREATED: (name: string) => `[DEPT] Created department "${name}"`,
  DEPT_UPDATED: (name: string, oldName: string) => `[DEPT] Updated department "${name}" — renamed from "${oldName}"`,
  DEPT_DELETED: (name: string) => `[DEPT] Deleted department "${name}"`,
  DEPT_IMPORTED: (succeeded: number, failed: number) => `[DEPT] Imported departments — ${succeeded} succeeded, ${failed} failed`,

  // ─── SECTION ──────────────────────────────────────────────────────────────
  SECTION_CREATED: (name: string) => `[SECTION] Created section "${name}"`,
  SECTION_UPDATED: (name: string, oldName: string, dept: string) =>
    `[SECTION] Updated section "${name}" — renamed from "${oldName}", department: ${dept}`,
  SECTION_DELETED: (name: string, dept: string) => `[SECTION] Deleted section "${name}" — department: ${dept}`,
  SECTION_IMPORTED: (succeeded: number, failed: number) => `[SECTION] Imported sections — ${succeeded} succeeded, ${failed} failed`,

  // ─── BACKUP ───────────────────────────────────────────────────────────────
  BACKUP_CREATED: (filename: string) => `[BACKUP] Created backup "${filename}"`,
  BACKUP_RESTORED: (filename: string) => `[BACKUP] Restored backup "${filename}"`,
  BACKUP_STARTED: (filename: string) => `[BACKUP] Started backup "${filename}"`,
  BACKUP_COMPLETED: (filename: string) => `[BACKUP] Completed backup "${filename}"`,
  BACKUP_FAILED: (filename: string) => `[BACKUP] Failed to create backup "${filename}"`,
  BACKUP_PROCESS_FAILED: '[BACKUP] Failed to start backup process',

  // ─── DATABASE ─────────────────────────────────────────────────────────────
  DB_CREATION_STARTED: (name: string) => `[DB] Started database creation "${name}"`,
  DB_CREATED: (name: string) => `[DB] Created database "${name}"`,
  DB_CREATION_FAILED: (name: string) => `[DB] Failed to create database "${name}"`,
  DB_RESTORE_STARTED: (name: string) => `[DB] Started restore to database "${name}"`,
  DB_RESTORED: (name: string) => `[DB] Restored database "${name}"`,
  DB_RESTORE_WARNINGS: (name: string) => `[DB] Completed restore with warnings — database "${name}"`,
  DB_RESTORE_FAILED: (name: string) => `[DB] Failed to restore database "${name}"`,
  DB_RESTORE_PROCESS_FAILED: '[DB] Failed to start restore process',
  DB_CLIENT_FAILED: '[DB] Failed to start database client',

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  SETTINGS_UPDATED: (key: string) => `[SETTINGS] Updated setting "${key}"`,
  SETTINGS_MAINTENANCE_ON: '[SETTINGS] Enabled maintenance mode',
  SETTINGS_MAINTENANCE_OFF: '[SETTINGS] Disabled maintenance mode',

  // ─── SCHEDULER ────────────────────────────────────────────────────────────
  SCHED_BACKUP_INIT: '[SCHEDULER] Scheduled Backup Service initialized (Daily at 02:00 AM)',
  SCHED_BACKUP_STARTED: '[SCHEDULER] Started scheduled backup',
  SCHED_BACKUP_COMPLETED: (filename: string) => `[SCHEDULER] Completed scheduled backup "${filename}"`,
  SCHED_BACKUP_FAILED: '[SCHEDULER] Failed to create scheduled backup',
  SCHED_FOUND_EXPIRED_BACKUPS: (count: number) => `[SCHEDULER] Found ${count} expired backups for cleanup`,
  SCHED_DELETED_BACKUP: (filename: string) => `[SCHEDULER] Deleted expired backup "${filename}"`,
  SCHED_DELETE_BACKUP_FAILED: (filename: string) => `[SCHEDULER] Failed to delete backup "${filename}"`,
  SCHED_CLEANUP_BACKUPS_FAILED: '[SCHEDULER] Failed to cleanup expired backups',
  SCHED_LOG_INIT: '[SCHEDULER] Scheduled Log Service initialized (Daily at 01:00 AM)',
  SCHED_LOG_CLEANUP_STARTED: '[SCHEDULER] Started scheduled log cleanup',
  SCHED_FOUND_EXPIRED_LOGS: (count: number) => `[SCHEDULER] Found ${count} expired log files for cleanup`,
  SCHED_CLEANUP_LOGS_FAILED: '[SCHEDULER] Failed to cleanup expired logs',
  SCHED_READ_LOG_FAILED: (file: string) => `[SCHEDULER] Failed to read log file "${file}"`,
  SCHED_DELETED_LOG: (file: string) => `[SCHEDULER] Deleted expired log "${file}"`,
  SCHED_DELETE_LOG_FAILED: (file: string) => `[SCHEDULER] Failed to delete log "${file}"`,

  // ─── SYSTEM (middleware) ──────────────────────────────────────────────────
  SYS_VALIDATION_FAILED: '[SYSTEM] Validation failed',
  SYS_SERVER_ERROR: '[SYSTEM] Server error',
  SYS_REQUEST_ERROR: (code: string) => `[SYSTEM] Request error — ${code}`,
  SYS_UNHANDLED_ERROR: '[SYSTEM] Unhandled error',
  SYS_RATE_LIMIT_LOGIN: '[SYSTEM] Exceeded rate limit — login attempts',
  SYS_RATE_LIMIT_API: '[SYSTEM] Exceeded rate limit — API requests',
  SYS_RATE_LIMIT_STRICT: '[SYSTEM] Exceeded rate limit — strict limit',
} as const

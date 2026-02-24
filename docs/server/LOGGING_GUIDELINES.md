# Logging Guidelines

> อัปเดตล่าสุด: 2026-02-24

---

## Architecture Overview

| ระบบ | ปลายทาง | Logger | วัตถุประสงค์ |
|------|---------|--------|-------------|
| **System Logs** | File (`storage/logs/app-YYYY-MM-DD.log`) | `logger` (request-scoped) / `logSystem` (standalone) | บันทึก events ของ application แบบ JSON Lines |
| **User Logs (Audit Trail)** | Database (ตาราง `user_log`) | `prisma.userLog.create()` | Snapshot ข้อมูล User ทุกครั้งที่มีการเปลี่ยนแปลง |

Event messages ทั้งหมดถูก centralize ไว้ใน `server/src/constants/log-events.ts` (`LogEvent` object)

---

## 1. User Logs — Audit Trail (Database / ตาราง `user_log`)

บันทึก **snapshot ข้อมูล User** ทุกครั้งที่มีการเปลี่ยนแปลง ผ่าน `logUserAction()` ใน service

| Action | เงื่อนไข | Service |
|--------|---------|---------|
| `CREATE` | Admin สร้าง User ใหม่ | `user.service` → `create()` |
| `UPDATE` | Admin แก้ไขข้อมูล User | `user.service` → `update()` |
| `UPDATE` | User แก้ไข Profile ตัวเอง (ชื่อ / email / tel) | `auth.service` → `updateProfile()` |
| `RESET_PASSWORD` | Admin Reset รหัสผ่าน | `user.service` → `resetPassword()` |
| `CHANGE_PASSWORD` | User เปลี่ยนรหัสผ่านตัวเอง | `user.service` → `changePassword()` |
| `DELETE` | Admin ลบ User | `user.service` → `delete()` |

---

## 2. System Logs — Application / Error Logs (File / `storage/logs/app-YYYY-MM-DD.log`)

บันทึก **events ของ application** แบบ JSON Lines ลงไฟล์รายวัน

### Authentication (`/auth`)

| Level | Event |
|-------|-------|
| INFO | `[AUTH] Logged in` |
| INFO | `[AUTH] Logged out` |

> **หมายเหตุ:** `AUTH_LOGIN_FAILED` และ `AUTH_SESSION_REPLACED` ถูกนิยามไว้ใน `LogEvent` แต่ยังไม่ได้ถูกเรียกใช้เป็น log call ในโค้ดปัจจุบัน

### Users (`/users`)

| Level | Event |
|-------|-------|
| INFO | `[USER] Created user "<username>"` |
| INFO | `[USER] Updated user "<username>"` |
| INFO | `[USER] Deleted user "<username>"` |
| INFO | `[USER] Reset password for user "<username>"` |
| INFO | `[USER] Imported users — <n> succeeded, <n> failed` |

### Departments (`/departments`)

| Level | Event |
|-------|-------|
| INFO | `[DEPT] Created department "<name>"` |
| INFO | `[DEPT] Updated department "<name>" — renamed from "<oldName>"` |
| INFO | `[DEPT] Deleted department "<name>"` |
| INFO | `[DEPT] Imported departments — <n> succeeded, <n> failed` |

### Sections (`/sections`)

| Level | Event |
|-------|-------|
| INFO | `[SECTION] Created section "<name>"` |
| INFO | `[SECTION] Updated section "<name>" — renamed from "<oldName>", department: <dept>` |
| INFO | `[SECTION] Deleted section "<name>" — department: <dept>` |
| INFO | `[SECTION] Imported sections — <n> succeeded, <n> failed` |

### Backup (`/backup`) — Route-level

| Level | Event |
|-------|-------|
| INFO | `[BACKUP] Created backup "<filename>"` |
| INFO | `[BACKUP] Restored backup "<filename>"` |

### Backup — Service-level (`logSystem`)

| Level | Event |
|-------|-------|
| INFO | `[BACKUP] Started backup "<filename>"` — pg_dump เริ่มทำงาน |
| INFO | `[BACKUP] Completed backup "<filename>"` — pg_dump สำเร็จ |
| ERROR | `[BACKUP] Failed to create backup "<filename>"` — pg_dump ล้มเหลว |
| ERROR | `[BACKUP] Failed to start backup process` — pg_dump spawn error |

### Database — Service-level (`logSystem`)

| Level | Event |
|-------|-------|
| INFO | `[DB] Started database creation "<name>"` — psql เริ่มสร้าง DB |
| INFO | `[DB] Created database "<name>"` — สร้าง DB สำเร็จ |
| ERROR | `[DB] Failed to create database "<name>"` — สร้าง DB ล้มเหลว |
| INFO | `[DB] Started restore to database "<name>"` — pg_restore เริ่มทำงาน |
| INFO | `[DB] Restored database "<name>"` — pg_restore สำเร็จ |
| WARN | `[DB] Completed restore with warnings — database "<name>"` — pg_restore exit code 1 |
| ERROR | `[DB] Failed to restore database "<name>"` — pg_restore ล้มเหลว |
| ERROR | `[DB] Failed to start restore process` — pg_restore spawn error |
| ERROR | `[DB] Failed to start database client` — psql spawn error |

### System Settings (`/system-settings`)

| Level | Event |
|-------|-------|
| WARN | `[SETTINGS] Enabled maintenance mode` — เปลี่ยน `maintenance_mode` เป็น `true` |
| INFO | `[SETTINGS] Disabled maintenance mode` — เปลี่ยน `maintenance_mode` เป็น `false` |
| INFO | `[SETTINGS] Updated setting "<key>"` — อัปเดต setting อื่น ๆ |

### Scheduler — Backup (`logSystem`)

| Level | Event |
|-------|-------|
| INFO | `[SCHEDULER] Started scheduled backup` — Cron trigger |
| INFO | `[SCHEDULER] Completed scheduled backup "<filename>"` |
| ERROR | `[SCHEDULER] Failed to create scheduled backup` |
| INFO | `[SCHEDULER] Found <n> expired backups for cleanup` |
| INFO | `[SCHEDULER] Deleted expired backup "<filename>"` |
| WARN | `[SCHEDULER] Failed to delete backup "<filename>"` |
| ERROR | `[SCHEDULER] Failed to cleanup expired backups` |

### Scheduler — Log Cleanup (`logSystem`)

| Level | Event |
|-------|-------|
| INFO | `[SCHEDULER] Started scheduled log cleanup` — Cron trigger |
| INFO | `[SCHEDULER] Found <n> expired log files for cleanup` |
| ERROR | `[SCHEDULER] Failed to cleanup expired logs` |
| WARN | `[SCHEDULER] Failed to read log file "<file>"` |
| INFO | `[SCHEDULER] Deleted expired log "<file>"` |
| WARN | `[SCHEDULER] Failed to delete log "<file>"` |

### Rate Limiting (Global Middleware)

| Level | Event | Limiter |
|-------|-------|---------|
| WARN | `[SYSTEM] Exceeded rate limit — login attempts` | `loginRateLimiter` — 15 ครั้ง / 15 นาที |
| WARN | `[SYSTEM] Exceeded rate limit — API requests` | `generalApiRateLimiter` — 100 ครั้ง / 15 นาที |
| WARN | `[SYSTEM] Exceeded rate limit — strict limit` | `strictRateLimiter` — 10 ครั้ง / 15 นาที |

### Global Error Handler

| Level | Event |
|-------|-------|
| WARN | `[SYSTEM] Validation failed` — ZodError (validation error) |
| WARN | `[SYSTEM] Request error — <code>` — AppError ที่ statusCode < 500 |
| ERROR | `[SYSTEM] Server error` — AppError ที่ statusCode ≥ 500 |
| ERROR | `[SYSTEM] Unhandled error` — Exception ที่ไม่ถูก catch ใน route handler |

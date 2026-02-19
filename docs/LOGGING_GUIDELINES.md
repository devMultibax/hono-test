# Logging Guidelines

> อัปเดตล่าสุด: 2026-02-19

---

## 1. User Logs — Audit Trail (Database / ตาราง `user_log`)

บันทึก **snapshot ข้อมูล User** ทุกครั้งที่มีการเปลี่ยนแปลง

| Action | เงื่อนไข | Service |
|--------|---------|---------|
| `CREATE` | Admin สร้าง User ใหม่ | `user.service` → `create()` |
| `CREATE` | Admin Import User จาก Excel (1 record ต่อ 1 User) | `user.service` → `importUsers()` |
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
| INFO | `Login successful` |
| INFO | `Logout successful` |
| WARN | `Login failed: <เหตุผล>` — credentials ผิด / บัญชีถูกระงับ |
| WARN | `Session replaced: user logged in from another device` — Login ขณะ session เดิมยังไม่หมดอายุ |

### Users (`/users`)

| Level | Event |
|-------|-------|
| INFO | `Created user "<username>"` |
| INFO | `Updated user ID <id>` |
| INFO | `Deleted user ID <id>` |
| INFO | `Reset password for user ID <id>` |
| INFO | `Imported users: <n> success, <n> failed` |

### Departments (`/departments`)

| Level | Event |
|-------|-------|
| INFO | `Created department "<name>"` |
| INFO | `Updated department "<old>" to "<new>"` |
| INFO | `Deleted department "<name>"` |
| INFO | `Imported departments: <n> success, <n> failed` |

### Sections (`/sections`)

| Level | Event |
|-------|-------|
| INFO | `Created section "<name>"` |
| INFO | `Updated section "<old>" to "<new>" in department "<dept>"` |
| INFO | `Deleted section "<name>" in department "<dept>"` |
| INFO | `Imported sections: <n> success, <n> failed` |

### Backup (`/backup`)

| Level | Event |
|-------|-------|
| INFO | `Created backup "<filename>"` |
| INFO | `Restored backup "<filename>"` |
| INFO | `Deleted backup "<filename>"` |

### System Settings (`/system-settings`)

| Level | Event |
|-------|-------|
| WARN | `System maintenance enabled (ปิดการใช้งานระบบ)` — เปลี่ยน `maintenance_mode` เป็น `true` |
| INFO | `System maintenance disabled (เปิดการใช้งานระบบ)` — เปลี่ยน `maintenance_mode` เป็น `false` |
| INFO | `SYSTEM_SETTINGS_UPDATE_SUCCESS` (พร้อม `key` และ `value`) — อัปเดต setting อื่น ๆ |

### Master Data (`/master-data`)

| Level | Event |
|-------|-------|
| ERROR | `Failed to fetch departments` |
| ERROR | `Failed to fetch sections` |
| ERROR | `Failed to search sections` |
| ERROR | `Failed to fetch users` |
| ERROR | `Failed to fetch users from logs` |

### Rate Limiting (Global Middleware)

| Level | Event | Limiter |
|-------|-------|---------|
| WARN | `Rate limit exceeded: too many login attempts` | `loginRateLimiter` — 15 ครั้ง / 15 นาที |
| WARN | `Rate limit exceeded: too many API requests` | `generalApiRateLimiter` — 100 ครั้ง / 15 นาที |
| WARN | `Rate limit exceeded: strict limit reached` | `strictRateLimiter` — 10 ครั้ง / 15 นาที |

### Global Error Handler

| Level | Event |
|-------|-------|
| ERROR | `Unhandled error` — Exception ที่ไม่ถูก catch ใน route handler |

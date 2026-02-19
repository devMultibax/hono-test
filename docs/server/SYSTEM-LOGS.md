# System Logs — Hono Server (สถานะปัจจุบัน)

## ภาพรวมระบบ Log

ระบบ Hono ใช้ **2 ช่องทาง** ในการเก็บ log:

| ช่องทาง | เก็บอะไร | ที่เก็บ |
|---------|---------|--------|
| **File-based Log** | HTTP request events (structured JSON) | `storage/logs/app-YYYY-MM-DD.log` |
| **Database Log** | User audit trail (CRUD + Login/Logout) | Prisma `UserLog` table |

---

## 1. File-based System Log

### รูปแบบ JSON ในไฟล์

```json
{
  "datetime": "2025-01-15 14:30:22",
  "level": "info | warn | error",
  "username": "john.doe",
  "fullName": "John Doe",
  "method": "POST",
  "url": "/auth/login",
  "ip": "192.168.1.1",
  "event": "Login successful"
}
```

### การหมุนไฟล์

- ไฟล์ใหม่ทุกวัน: `app-YYYY-MM-DD.log`
- ลบไฟล์เก่าอัตโนมัติ: scheduled cleanup รันทุกวัน 01:00 น.
- Path: `storage/logs/`

---

## 2. Events ที่ถูก Log (จำแนกตาม Route)

### Authentication (`/auth`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Login successful` | INFO | Login สำเร็จ |
| `Login failed: <reason>` | WARN | Login ล้มเหลว (username/password ผิด, account disabled) |
| `Session replaced: logged in from another device` | WARN | Login ขณะที่มี session เดิมยังใช้งานได้อยู่ (single-session enforcement) |
| `Rate limit exceeded: too many login attempts` | WARN | เกิน 15 ครั้ง / 15 นาที (ต่อ IP) |
| `Logout successful` | INFO | Logout สำเร็จ |
| `Unhandled error` | ERROR | Error ที่ไม่คาดคิดใน global error handler |

> **หมายเหตุ:**
> - login fail จะ override username/fullName ด้วยค่าที่ user พิมพ์มา (ยังไม่มี session)
> - Session replaced log จะปรากฏก่อน Login successful log เสมอ (เกิดขึ้นใน request เดียวกัน)

---

### Users (`/users`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Created user "<username>"` | INFO | สร้าง user สำเร็จ |
| `Updated user #<id>` | INFO | แก้ไข user สำเร็จ |
| `Deleted user #<id>` | INFO | ลบ user สำเร็จ |
| `Reset password for user #<id>` | INFO | Reset รหัสผ่านสำเร็จ |
| `Imported users: <n> success, <n> failed` | INFO | Import Excel สำเร็จ |
| `Unhandled error` | ERROR | Error ที่ไม่คาดคิด (ผ่าน global error handler) |

---

### Departments (`/departments`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Created department "<name>"` | INFO | สร้าง department สำเร็จ |
| `Updated department "<old>" to "<new>"` | INFO | แก้ไข department สำเร็จ |
| `Deleted department "<name>"` | INFO | ลบ department สำเร็จ |
| `Imported departments: <n> success, <n> failed` | INFO | Import Excel สำเร็จ |
| `Unhandled error` | ERROR | Error ที่ไม่คาดคิด (ผ่าน global error handler) |

---

### Sections (`/sections`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Created section "<name>"` | INFO | สร้าง section สำเร็จ |
| `Updated section "<old>" to "<new>" in department "<dept>"` | INFO | แก้ไข section สำเร็จ |
| `Deleted section "<name>" in department "<dept>"` | INFO | ลบ section สำเร็จ |
| `Imported sections: <n> success, <n> failed` | INFO | Import Excel สำเร็จ |
| `Unhandled error` | ERROR | Error ที่ไม่คาดคิด (ผ่าน global error handler) |

---

### Backup (`/backup`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Created backup "<filename>"` | INFO | สร้าง backup สำเร็จ |
| `Restored backup "<filename>"` | INFO | Restore backup สำเร็จ |
| `Deleted backup "<filename>"` | INFO | ลบ backup สำเร็จ |
| `Unhandled error` | ERROR | Error ที่ไม่คาดคิด (ผ่าน global error handler) |

---

### Rate Limiting (Global)

| Event | Level | Limiter | เงื่อนไข |
|-------|-------|---------|---------|
| `Rate limit exceeded: too many API requests` | WARN | `generalApiRateLimiter` | เกิน 100 ครั้ง / 15 นาที (ทุก route) |
| `Rate limit exceeded: strict limit reached` | WARN | `strictRateLimiter` | เกิน 10 ครั้ง / 15 นาที (routes เฉพาะ) |

> **หมายเหตุ:** `loginRateLimiter` อยู่ภายใต้หัวข้อ Authentication ด้านบน

---

### System Settings (`/system-settings`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Maintenance mode enabled` | WARN | เปลี่ยน `maintenance_mode` เป็น `true` |
| `Maintenance mode disabled` | INFO | เปลี่ยน `maintenance_mode` เป็น `false` |
| `Updated setting "<key>"` | INFO | อัปเดต setting อื่น ๆ สำเร็จ |

---

### Master Data (`/master-data`)

| Event | Level | เงื่อนไข |
|-------|-------|---------|
| `Failed to fetch departments` | ERROR | ดึงข้อมูล departments ล้มเหลว |
| `Failed to fetch sections` | ERROR | ดึงข้อมูล sections ล้มเหลว |
| `Failed to search sections` | ERROR | ค้นหา sections ล้มเหลว |
| `Failed to fetch users` | ERROR | ดึงข้อมูล users ล้มเหลว |
| `Failed to fetch users from logs` | ERROR | ดึงข้อมูล users จาก logs ล้มเหลว |

---

## 3. Database Audit Log (UserLog table)

เก็บ snapshot ของข้อมูล user ทุกครั้งที่มีการเปลี่ยนแปลง

### Actions ที่บันทึก

| Action | เงื่อนไข | Service |
|--------|---------|---------|
| `LOGIN` | User login สำเร็จ | `auth.service.ts` |
| `LOGOUT` | User logout สำเร็จ | `auth.service.ts` |
| `UPDATE` | แก้ไข profile ตัวเอง | `auth.service.ts` |
| `CREATE` | สร้าง user ใหม่ | `user.service.ts` |
| `UPDATE` | แก้ไข user (admin) | `user.service.ts` |
| `DELETE` | ลบ user | `user.service.ts` |
| `UPDATE` | Reset รหัสผ่าน | `user.service.ts` |
| `UPDATE` | เปลี่ยนสถานะ (active/inactive) | `user.service.ts` |

### ข้อมูลที่บันทึกต่อ record

```
username, firstName, lastName, department, section,
email, tel, role, status,
createdAt, createdBy, updatedAt, updatedBy,
actionType, actionAt
```

---

## 4. ข้อมูลที่แนบมาในทุก File Log Entry

| Field | คำอธิบาย | ตัวอย่าง |
|-------|---------|---------|
| `datetime` | วันเวลา | `2025-01-15 14:30:22` |
| `level` | ระดับ log | `info`, `warn`, `error` |
| `username` | ชื่อผู้ใช้ที่ทำ action | `john.doe` หรือ `anonymous` |
| `fullName` | ชื่อ-นามสกุล | `John Doe` หรือ `-` |
| `method` | HTTP method | `GET`, `POST`, `PUT`, `DELETE` |
| `url` | URL path | `/departments/5` |
| `ip` | IP address ของผู้เรียก | `192.168.1.1` หรือ `127.0.0.1` |
| `event` | คำอธิบาย event | `Deleted department "ฝ่ายบริหาร"` |

---

## 5. สิ่งที่ยังไม่ Log เข้า Structured Log

| สิ่ง | วิธีปัจจุบัน | เหตุผล |
|-----|------------|-------|
| Scheduled backup (daily 02:00) | `console.log` | ไม่มี request context (`c`) |
| Scheduled log cleanup (daily 01:00) | `console.log` | ไม่มี request context (`c`) |
| Backup process (pg_dump/pg_restore) | `console.log` | Infrastructure level |
| Server startup/shutdown | `console.log` | Infrastructure level |

# แผนการพัฒนาระบบ Hono ให้ครบถ้วนตามระบบ Express

## สถานะปัจจุบัน

ระบบ Hono ได้พัฒนาฟีเจอร์หลักไปแล้ว ได้แก่:
- ✅ Authentication & Authorization (JWT - ต้องเปลี่ยนเป็น Cookie-based)
- ✅ User Management (CRUD)
- ✅ Department Management (CRUD)
- ✅ Section Management (CRUD)
- ✅ Role-based Access Control
- ✅ Zod Validation
- ✅ Prisma ORM Integration
- ✅ Health Check Endpoints

## ฟีเจอร์ที่ยังขาดจากระบบเก่า

### 1. Security Features (ความปลอดภัย)
- ❌ Cookie-based Authentication (ต้องเปลี่ยนจาก Bearer Token)
- ❌ CSRF Protection
- ❌ Rate Limiting
- ❌ Security Headers
- ❌ Input Sanitization & Validation
- ❌ Environment Config Validation

### 2. Admin Functions (ฟังก์ชันผู้ดูแลระบบ)
- ❌ Database Statistics
- ❌ Database Analysis
- ❌ System Logs Viewing
- ❌ Backup Management
- ❌ Backup Restoration

### 3. Export & Import Features (นำเข้า-ส่งออกข้อมูล)
- ❌ Pagination & Filtering (จำเป็นก่อนทำ Export/Import)
- ❌ Excel Export (Users, Departments, Sections)
- ❌ PDF Export (Users, Departments, Sections)
- ❌ Excel Import (Departments, Sections)
- ❌ File Upload Support

### 4. Master Data Endpoints (API ข้อมูลหลัก)
- ❌ GET /master-data/departments
- ❌ GET /master-data/departments/:id/sections
- ❌ POST /master-data/departments/sections/search
- ❌ GET /master-data/users
- ❌ GET /master-data/users/from-logs

### 5. Enhanced User Management
- ❌ Password Verification Endpoint
- ❌ Password Reset Endpoint
- ❌ Default Password Tracking
- ❌ User Profile Update Endpoint (PUT /auth/me)
- ❌ User Password Update Endpoint (PUT /auth/me/password)

### 6. Automated Tasks (งานอัตโนมัติ)
- ❌ Scheduled Database Backups (Daily at 02:00 AM)
- ❌ Log Rotation

### 7. User Activity Logging
- ❌ Comprehensive User Action Logging (ครอบคลุมทุก action)
- ❌ User Log Retrieval API

### 8. API Documentation
- ❌ Swagger/OpenAPI Documentation (auto-generate จาก Zod schemas)

---

## แผนการพัฒนา (Implementation Plan)

### Phase 1: Security & Authentication (สัปดาห์ที่ 1-2)

#### 1.1 Cookie-based Authentication
**Priority: CRITICAL**
- เปลี่ยนจาก Bearer Token เป็น Cookie-based JWT
- ตั้งค่า HttpOnly, Secure, SameSite cookies
- Token versioning สำหรับ revocation
- เพิ่ม logout endpoint (clear cookie)

**Files to modify:**
- `src/middleware/auth.ts`
- `src/services/auth.service.ts`
- `src/routes/auth.routes.ts`
- `src/config/env.ts`

#### 1.2 Rate Limiting
**Priority: CRITICAL**
- เพิ่ม rate limiting middleware ป้องกัน brute force attacks
- กำหนด limits แยกตาม endpoint
- Libraries: `@hono/rate-limiter`

**Files to create/modify:**
- `src/middleware/rate-limit.ts`
- `src/index.ts`

#### 1.3 CSRF Protection
**Priority: HIGH**
- สร้าง CSRF token generation และ validation
- เพิ่ม endpoint GET /auth/csrf-token
- Implement CSRF middleware สำหรับ POST/PUT/DELETE requests

**Files to create/modify:**
- `src/middleware/csrf.ts`
- `src/routes/auth.routes.ts`
- `src/lib/csrf-utils.ts`

#### 1.4 Security Headers
**Priority: MEDIUM**
- เพิ่ม security headers middleware
- Configure Content Security Policy, X-Frame-Options, etc.

**Files to create/modify:**
- `src/middleware/security-headers.ts`
- `src/index.ts`

#### 1.5 Input Sanitization & Validation
**Priority: CRITICAL**
- XSS protection สำหรับ user input
- File upload validation (ขนาด, ชนิดไฟล์, MIME type)
- SQL Injection prevention (Prisma ช่วยอยู่แล้ว)

**Files to create:**
- `src/utils/sanitize.utils.ts`
- `src/utils/file-validator.utils.ts`

#### 1.6 Environment Config Validation
**Priority: CRITICAL**
- ใช้ Zod validate environment variables
- ป้องกัน runtime errors จาก config ผิด

**Files to modify:**
- `src/config/env.ts`

#### 1.7 API Documentation (Swagger)
**Priority: CRITICAL**
- Auto-generate Swagger docs จาก Zod schemas
- Interactive API documentation
- Libraries: `@hono/zod-openapi`

**Files to create/modify:**
- `src/index.ts` (setup OpenAPI)
- `src/routes/*.routes.ts` (add OpenAPI metadata)

---

### Phase 2: Data Management & Export Features (สัปดาห์ที่ 3-4)

#### 2.0 Pagination & Filtering
**Priority: HIGH**
- เพิ่ม **offset-based pagination** (page, limit) สำหรับทุก list endpoints
- เพิ่ม **database indexes** (username, email, departmentId, sectionId, createdAt, status)
- สร้าง **pagination utility** ที่ยืดหยุ่น (centralized logic)
- Query params: page, limit, sort, search
- Filter by department, section, role, status
- Response format: { data, pagination: { total, page, limit, totalPages } }

**หมายเหตุสำหรับอนาคต:**
- เมื่อเพิ่ม module ที่มีข้อมูล > 10k rows → พิจารณาเพิ่ม cursor-based pagination
- Pagination utility ออกแบบให้รองรับทั้ง offset และ cursor (flexible)

**Files to create:**
- `src/utils/pagination.utils.ts` (abstraction layer)

**Files to modify:**
- `prisma/schema.prisma` (เพิ่ม @@index สำหรับ performance)
- `src/routes/users.routes.ts`
- `src/routes/department.routes.ts`
- `src/routes/section.routes.ts`
- `src/services/*.service.ts`
- `src/schemas/*.schema.ts` (add pagination schemas)

#### 2.1 Excel Export
**Priority: HIGH**
- User list export to Excel
- Department list export to Excel
- Section list export to Excel
- **Export strategy แยกตามขนาดข้อมูล:**
  - < 10k rows: Normal export (fast, simple)
  - 10k-50k rows: **Streaming export** (memory efficient)
  - \> 50k rows: Error + suggest filters
- Libraries: `exceljs` (มี streaming API)

**Files to create:**
- `src/services/export.service.ts` (มี logic แยก strategy ตามขนาดข้อมูล)
- `src/routes/users.routes.ts` (add GET /export/excel)
- `src/routes/department.routes.ts` (add GET /export/excel)
- `src/routes/section.routes.ts` (add GET /export/excel)

#### 2.2 PDF Export
**Priority: HIGH**
- User list export to PDF with custom formatting
- Department/Section export to PDF
- Thai font support
- **Export strategy แยกตามขนาดข้อมูล:** (เหมือน Excel Export)
  - < 10k rows: Normal export
  - 10k-50k rows: **Streaming export**
  - \> 50k rows: Error + suggest filters
- Libraries: `pdfkit`, `@pdf-lib/fontkit`

**Files to create:**
- `src/services/pdf-export.service.ts` (มี streaming support)
- `src/routes/users.routes.ts` (add GET /export/pdf)
- `src/routes/department.routes.ts` (add GET /export/pdf)
- `src/routes/section.routes.ts` (add GET /export/pdf)
- `assets/fonts/` (Thai fonts)

#### 2.3 Excel Import
**Priority: HIGH**
- Department import from Excel
- Section import from Excel
- File upload handling
- Libraries: `@hono/node-server` with multipart, `xlsx`

**Files to create:**
- `src/services/import.service.ts`
- `src/middleware/upload.ts`
- `src/routes/department.routes.ts` (add POST /import)
- `src/routes/section.routes.ts` (add POST /import)
- `src/schemas/import.schema.ts`
- `storage/uploads/` (upload directory)

---

### Phase 3: Master Data Endpoints (สัปดาห์ที่ 5)

#### 3.1 Master Data Routes
**Priority: MEDIUM**
- GET /master-data/departments - ดึงข้อมูล departments ทั้งหมด (simplified)
- GET /master-data/departments/:id/sections - ดึง sections ของ department
- POST /master-data/departments/sections/search - ค้นหา sections ตามชื่อ
- GET /master-data/users - ดึงข้อมูล users ทั้งหมด
- GET /master-data/users/from-logs - ดึงข้อมูล users จาก logs

**Files to create:**
- `src/routes/master-data.routes.ts`
- `src/services/master-data.service.ts`
- `src/schemas/master-data.schema.ts`

---

### Phase 4: Enhanced User Management (สัปดาห์ที่ 6)

#### 4.1 Password Management
**Priority: HIGH**
- POST /users/password/verify - ตรวจสอบรหัสผ่าน
- PATCH /users/:id/password/reset - รีเซ็ตรหัสผ่าน
- PUT /auth/me/password - เปลี่ยนรหัสผ่านตัวเอง
- เพิ่ม tracking `isDefaultPassword` ใน User model

**Files to modify:**
- `prisma/schema.prisma` (add isDefaultPassword, tokenVersion fields)
- `src/routes/users.routes.ts`
- `src/routes/auth.routes.ts`
- `src/services/user.service.ts`
- `src/services/auth.service.ts`
- `src/schemas/user.schema.ts`

#### 4.2 User Profile Management
**Priority: MEDIUM**
- GET /auth/me - ดึงข้อมูล current user
- PUT /auth/me - อัปเดตข้อมูลตัวเอง

**Files to modify:**
- `src/routes/auth.routes.ts`
- `src/services/auth.service.ts`
- `src/schemas/auth.schema.ts`

---

### Phase 5: Admin Functions (สัปดาห์ที่ 7-8)

#### 5.1 Database Management
**Priority: HIGH**
- GET /api/database/statistics - สถิติฐานข้อมูล (table sizes, row counts)
- POST /api/database/analyze - วิเคราะห์ฐานข้อมูล

**Files to create:**
- `src/routes/database.routes.ts`
- `src/services/database.service.ts`
- `src/middleware/permission.ts` (ensure admin only)

#### 5.2 System Logs
**Priority: MEDIUM**
- GET /api/admin/logs - ดูระบบล็อก
- Enhanced logging with Pino (เร็วกว่า Winston, เหมาะกับ Hono)
- Daily log rotation
- Libraries: `pino`, `pino-http`

**Files to create:**
- `src/routes/admin.routes.ts`
- `src/services/system-log.service.ts`
- `src/lib/logger.ts` (replace console logs with Pino)
- `storage/logs/` (log directory)

#### 5.3 Backup Management
**Priority: HIGH**
- GET /api/admin/backup - รายการ backups
- POST /api/admin/backup - สร้าง backup
- GET /api/admin/backup/:fileName - ดูข้อมูล backup
- POST /api/admin/backup/:fileName/restore - restore จาก backup
- Libraries: `pg_dump` wrapper, `child_process`

**Files to create:**
- `src/routes/backup.routes.ts`
- `src/services/backup.service.ts`
- `src/utils/pgpass.utils.ts`
- `src/utils/file.utils.ts`
- `storage/backups/` (backup directory)

---

### Phase 6: Automated Tasks (สัปดาห์ที่ 9)

#### 6.1 Scheduled Backups
**Priority: MEDIUM**
- Daily database backup at 02:00 AM
- Backup retention policy (e.g., keep last 30 days)
- Libraries: `node-cron`

**Files to create:**
- `src/services/scheduled-backup.service.ts`
- `src/index.ts` (start cron job)

#### 6.2 Log Rotation
**Priority: LOW**
- Automatic log rotation and cleanup
- Pino automatic rotation

**Files to modify:**
- `src/lib/logger.ts`

---

### Phase 7: Enhanced User Activity Logging (สัปดาห์ที่ 10)

#### 7.1 Comprehensive Logging
**Priority: MEDIUM**
- Log all user actions: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- Extend UserLog model if needed
- Ensure all service methods call logging

**Files to modify:**
- `prisma/schema.prisma` (verify UserLog model)
- `src/services/auth.service.ts`
- `src/services/user.service.ts`
- `src/services/department.service.ts`
- `src/services/section.service.ts`

#### 7.2 User Log Retrieval
**Priority: LOW**
- API endpoint to retrieve user activity logs
- Filtering by date, user, action type

**Files to create:**
- `src/routes/user-logs.routes.ts`
- `src/services/user-log.service.ts`

---

### Phase 8: Testing & Quality Assurance (สัปดาห์ที่ 11-12)

#### 8.1 Testing
**Priority: HIGH**
- Unit tests for services
- Integration tests for routes
- E2E tests
- Libraries: `vitest`, `supertest`

**Files to create:**
- `tests/unit/`
- `tests/integration/`
- `tests/e2e/`
- `vitest.config.ts`

---

## ลำดับความสำคัญ (Priority Summary)

### Critical (ต้องทำก่อนหมด - Phase 1)
1. **Cookie-based Authentication** (เปลี่ยนจาก Bearer Token)
2. **Rate Limiting & CSRF Protection**
3. **API Documentation** (Swagger/OpenAPI)
4. **Input Sanitization & Validation**
5. **Environment Config Validation**

### High Priority (สำคัญมาก - Phase 2-4)
6. **Pagination & Filtering**
7. **Excel/PDF Export** (Users, Departments, Sections)
8. **Excel Import** (Departments, Sections)
9. **Password Management** (Reset, Verify)
10. **Database Backup & Restore**
11. **Testing Implementation**

### Medium Priority (ปานกลาง - Phase 5-7)
12. Database Statistics & Analysis
13. System Logs Viewing (Pino)
14. Master Data Endpoints
15. User Profile Management
16. Scheduled Backups
17. Comprehensive User Logging

### Low Priority (ทำทีหลัง)
18. Security Headers
19. Log Rotation
20. User Log Retrieval API

---

## ข้อแนะนำในการดำเนินการ

### ขั้นตอนที่ 1: ติดตั้ง Dependencies
```bash
# Phase 1: Security & Authentication
npm install @hono/rate-limiter @hono/zod-openapi

# Phase 2: Export & Import
npm install exceljs xlsx pdfkit @pdf-lib/fontkit
npm install --save-dev @types/pdfkit

# Phase 5: Logging
npm install pino pino-http

# Phase 6: Scheduled Tasks
npm install node-cron
npm install --save-dev @types/node-cron
```

### ขั้นตอนที่ 2: อัปเดต Prisma Schema
เพิ่ม fields ที่ขาด:
- `User.isDefaultPassword` (Boolean)
- `User.tokenVersion` (Int)

รัน migration:
```bash
npx prisma migrate dev --name add_missing_user_fields
```

### ขั้นตอนที่ 3: สร้างโครงสร้างไดเรกทอรี
```bash
mkdir -p storage/backups storage/logs storage/uploads assets/fonts
```

### ขั้นตอนที่ 4: พัฒนาตาม Phase
เริ่มจาก Phase 1 (Security) และดำเนินการตามลำดับ

### ขั้นตอนที่ 5: Testing
เขียน tests ควบคู่กับการพัฒนาแต่ละ feature

---

## สรุปความแตกต่างหลัก

| ฟีเจอร์ | Express (เก่า) | Hono (ใหม่) | สถานะ |
|---------|---------------|------------|-------|
| Authentication | JWT Cookies | Bearer Token | ⚠️ ต้องเปลี่ยนเป็น Cookie |
| CRUD Operations | ✅ | ✅ | ✅ เสร็จสมบูรณ์ |
| API Documentation | ❌ | ❌ | ❌ ต้องเพิ่ม Swagger |
| Pagination/Filter | ✅ | ❌ | ❌ ต้องเพิ่ม |
| Export Excel/PDF | ✅ | ❌ | ❌ ยังไม่มี |
| Import Excel | ✅ | ❌ | ❌ ยังไม่มี |
| CSRF Protection | ✅ | ❌ | ❌ ยังไม่มี |
| Rate Limiting | ✅ | ❌ | ❌ ยังไม่มี |
| Input Sanitization | ✅ | ❌ | ❌ ยังไม่มี |
| Backup System | ✅ | ❌ | ❌ ยังไม่มี |
| Database Stats | ✅ | ❌ | ❌ ยังไม่มี |
| System Logs | Winston | Console | ⚠️ ต้องใช้ Pino |
| Master Data API | ✅ | ❌ | ❌ ยังไม่มี |
| Password Reset | ✅ | ❌ | ❌ ยังไม่มี |
| User Logging | Partial | Partial | ⚠️ ต้องปรับปรุง |

---

## ระยะเวลาโดยประมาณ

- **Phase 1** (Security & Auth): 2 สัปดาห์
- **Phase 2** (Data Management & Export/Import): 2-3 สัปดาห์
- **Phase 3-4** (Master Data + User Management): 2 สัปดาห์
- **Phase 5-6** (Admin Functions + Automation): 2-3 สัปดาห์
- **Phase 7-8** (Logging + Testing): 2-3 สัปดาห์

**รวมทั้งหมด**: ประมาณ 10-13 สัปดาห์

---

## หมายเหตุ

1. แผนนี้ครอบคลุมการย้ายฟีเจอร์ทั้งหมดจากระบบ Express มาสู่ Hono
2. **เปลี่ยนจาก Bearer Token เป็น Cookie-based JWT** (ตรงกับระบบเก่า)
3. **ไม่ใช้ Docker** - deploy ด้วย PM2 เหมือนเดิม
4. **ใช้ Pino แทน Winston** - เร็วกว่าและเหมาะกับ Hono
5. สามารถปรับลำดับการพัฒนาตามความสำคัญของธุรกิจได้
6. ควรทำ testing ควบคู่ไปกับการพัฒนา
7. Prisma ORM ช่วยให้การจัดการฐานข้อมูลง่ายและปลอดภัยกว่า raw SQL
8. Hono มี performance ที่ดีกว่า Express โดยเฉพาะใน edge runtime

## การเปลี่ยนแปลงสำคัญจากเวอร์ชันแรก

### เพิ่มใหม่:
- ✅ Cookie-based Authentication (ย้ายมา Phase 1 - Critical)
- ✅ API Documentation (Swagger/OpenAPI)
- ✅ Pagination & Filtering
- ✅ Input Sanitization & Validation
- ✅ Environment Config Validation

### แก้ไข:
- 🔄 เปลี่ยน Winston → Pino (เร็วกว่า)
- 🔄 Cookie Auth จาก Optional → Required
- 🔄 Excel Import จาก Medium → High Priority

### ลบออก:
- ❌ Docker Setup (ใช้ PM2 อยู่แล้ว)
- ❌ Bearer Token support (Web App เท่านั้น)
- ❌ Migration System section (Prisma จัดการแล้ว)

---

**เอกสารนี้สร้างโดย**: Claude Code
**วันที่**: 2026-01-16
**เวอร์ชัน**: 2.0 (ปรับปรุง)

# 🔐 Login Credentials

บัญชีผู้ใช้ที่สร้างจาก Seed Script

## Admin Account

```
Username: 682732
Password: (ใช้ hash จากไฟล์เดิม - seeds/003_seed_users.sql)
Role: ADMIN
Department: IT
Email: it-pro@multibax.com
```

**สิทธิ์:**
- เข้าถึงและแก้ไขข้อมูลทั้งหมด
- สร้าง/แก้ไข/ลบ Departments
- สร้าง/แก้ไข/ลบ Sections
- สร้าง/แก้ไข/ลบ Users

## Test User Account

```
Username: test01
Password: test123
Role: USER
Department: ADM
Section: ADMIN
Email: test@multibax.com
```

**สิทธิ์:**
- ดูข้อมูล Departments, Sections, Users
- **ไม่สามารถ** สร้าง/แก้ไข/ลบข้อมูลใดๆ

## การใช้งาน

### 1. Login ด้วย Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "682732",
    "password": "YOUR_PASSWORD"
  }'
```

### 2. Login ด้วย Test User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test01",
    "password": "test123"
  }'
```

### 3. ใช้ Token ที่ได้รับ
```bash
curl http://localhost:3000/departments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## ข้อมูล Departments และ Sections

### Departments (23 แผนก)
STD, ST, SE, SAF, PD5, PD3, PD2, PD1, PD, PC, PA, MT5, MT3, MT2, MT1, FN, EN, BIO, ADM, AC, QC, PN, IT

### Sections ที่สำคัญ

**ADM Department:**
- ADMIN

**PD1 Department:**
- 1/1, 1/2, 1/3

**PD2 Department:**
- 2/1, 2/2, 2/3

**PD3 Department:**
- 3/1, 3/2, 3/3, 3/4

**QC Department:**
- QC, QC1, QC2, QC3, QC5, LAB, FG, CBT

**ST Department:**
- DR&FG, PF, RM&EM

## การสร้าง User ใหม่

ต้องใช้บัญชี **ADMIN** เท่านั้น:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "username": "user02",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "departmentId": 1,
    "sectionId": 1,
    "email": "john@example.com",
    "tel": "0812345678",
    "role": "USER"
  }'
```

## หมายเหตุ

- ⚠️ **อย่าเปิดเผย credentials ใน production**
- เปลี่ยน password ทันทีหลัง deploy
- ใช้ environment variables สำหรับ sensitive data
- ตั้งค่า JWT_SECRET ที่แข็งแรง (min 32 characters)

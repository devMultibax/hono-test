# Database Seed

ไฟล์นี้จะสร้างข้อมูลเริ่มต้นในฐานข้อมูล

## ข้อมูลที่จะถูกสร้าง

### 1. Departments (23 แผนก)
- STD, ST, SE, SAF, PD5, PD3, PD2, PD1, PD, PC
- PA, MT5, MT3, MT2, MT1, FN, EN, BIO, ADM, AC
- QC, PN, IT

### 2. Sections (ฝ่ายต่างๆ)
- **ADM**: ADMIN
- **PD1**: 1/1, 1/2, 1/3
- **PD2**: 2/1, 2/2, 2/3
- **PD3**: 3/1, 3/2, 3/3, 3/4
- **PD5**: 5/2
- **QC**: QC, QC1, QC2, QC3, QC5, LAB, FG, CBT
- **ST**: DR&FG, PF, RM&EM

### 3. Users

**Admin User:**
- Username: `682732`
- Password: (hashed - จากไฟล์เดิม)
- Name: Disakorn Nisakuntong
- Department: IT
- Role: ADMIN
- Email: it-pro@multibax.com

**Test User:**
- Username: `test01`
- Password: `test123`
- Name: Test User
- Department: ADM
- Section: ADMIN
- Role: USER
- Email: test@multibax.com

## วิธีใช้งาน

### 1. Run Seed
```bash
npx prisma db seed
```

### 2. Reset Database และ Seed ใหม่
```bash
npx prisma migrate reset
```
คำสั่งนี้จะ:
- ลบข้อมูลทั้งหมด
- Run migrations ใหม่
- Run seed script อัตโนมัติ

### 3. Seed โดยไม่ Reset
ถ้าต้องการ seed ข้อมูลเพิ่มโดยไม่ลบข้อมูลเดิม:
```bash
npx prisma db seed
```

Script ใช้ `upsert` จึงไม่ทำให้เกิด duplicate data

## การแก้ไข Seed

แก้ไขไฟล์: `prisma/seed.ts`

หลังจากแก้ไข run:
```bash
npx prisma db seed
```

## หมายเหตุ

- Script ใช้ `upsert` เพื่อป้องกัน duplicate entries
- Department names ต้อง unique
- Section names ต้อง unique ภายใน department เดียวกัน
- Username ต้อง unique และมีความยาวพอดี 6 ตัวอักษร

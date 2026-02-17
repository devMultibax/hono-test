# 🚀 Setup Guide - Hono API Server

คู่มือการติดตั้งและใช้งานระบบ API ที่สร้างด้วย Hono framework

## ⚠️ สิ่งที่ต้องทำก่อนรันโปรเจกต์

ตอนนี้โครงสร้างโค้ดพร้อมแล้ว แต่ยังมี **TypeScript errors** เพราะ Prisma Client ยังไม่ได้ถูก generate ตาม schema ใหม่

## 📋 ขั้นตอนการ Setup

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. สร้างไฟล์ .env
สร้างไฟล์ `.env` จาก `.env.example`:
```bash
cp .env.example .env
```

แก้ไขค่าใน `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
PORT=3000
NODE_ENV=development
```

**สำคัญ**: JWT_SECRET ต้องมีความยาวอย่างน้อย 32 ตัวอักษร

### 3. Generate Prisma Client
```bash
npx prisma generate
```

คำสั่งนี้จะ:
- อ่าน `prisma/schema.prisma`
- สร้าง TypeScript types และ Prisma Client
- แก้ไข TypeScript errors ทั้งหมดที่เกี่ยวข้องกับ Prisma

### 4. Run Database Migration
```bash
npx prisma migrate dev --name init
```

คำสั่งนี้จะ:
- สร้างตาราง database ตาม schema
- สร้างไฟล์ migration ใน `prisma/migrations/`
- Generate Prisma Client อีกครั้งโดยอัตโนมัติ

### 5. Seed Database
สร้างข้อมูลเริ่มต้นในฐานข้อมูล:

```bash
npx prisma db seed
```

คำสั่งนี้จะสร้าง:
- **23 Departments** (STD, ST, SE, SAF, PD5, PD3, PD2, PD1, PD, PC, PA, MT5, MT3, MT2, MT1, FN, EN, BIO, ADM, AC, QC, PN, IT)
- **Sections** ตาม departments ต่างๆ (เช่น PD1: 1/1, 1/2, 1/3)
- **Admin User**: username `682732` (จาก IT department)
- **Test User**: username `test01`, password `test123` (สำหรับทดสอบ)

ดูรายละเอียดเพิ่มเติมได้ที่ [prisma/SEED_README.md](./prisma/SEED_README.md)

### 6. รัน Development Server
```bash
npm run dev
```

Server จะรันที่ `http://localhost:3000`

## ✅ ตรวจสอบว่าติดตั้งสำเร็จ

1. เปิด browser ไปที่ `http://localhost:3000`
   - ควรเห็น: `{"message":"Hono API Server","version":"1.0.0","status":"running"}`

2. ตรวจสอบ database health:
   ```bash
   curl http://localhost:3000/health/db
   ```

3. Login ด้วย Admin Account:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "682732",
       "password": "ใช้ password จาก hash เดิม"
     }'
   ```

4. Login ด้วย Test User:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "test01",
       "password": "test123"
     }'
   ```

5. ดู Departments:
   ```bash
   curl http://localhost:3000/departments \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## 🔧 Commands สำคัญ

```bash
# Development
npm run dev                    # รัน dev server พร้อม hot reload

# Production
npm run build                  # Build สำหรับ production
npm start                      # รัน production server

# Prisma
npx prisma generate            # Generate Prisma Client
npx prisma migrate dev         # สร้าง migration ใหม่
npx prisma migrate deploy      # Deploy migrations (production)
npx prisma studio              # เปิด Prisma Studio (GUI)
npx prisma db push             # Push schema โดยไม่สร้าง migration
npx prisma db seed             # Run seed script

# Database
npx prisma migrate reset       # ⚠️ ลบข้อมูลทั้งหมดและ migrate ใหม่
```

## 📝 หมายเหตุ

1. **TypeScript Errors**: ถ้ายังมี errors หลัง generate Prisma Client ให้ restart TypeScript server ใน VS Code:
   - กด `Ctrl+Shift+P` (Windows/Linux) หรือ `Cmd+Shift+P` (Mac)
   - พิมพ์ "TypeScript: Restart TS Server"

2. **Database URL**: ต้องแน่ใจว่า PostgreSQL รันอยู่และ connection string ใน `.env` ถูกต้อง

3. **Port Conflict**: ถ้า port 3000 ถูกใช้งานอยู่ ให้เปลี่ยนใน `.env`

4. **JWT Secret**: อย่าใช้ JWT_SECRET เดียวกันใน production กับ development

## 🐛 Troubleshooting

### Error: "Invalid `prisma.xxx.xxx()` invocation"
- Run: `npx prisma generate`
- Restart VS Code

### Error: "Can't reach database server"
- ตรวจสอบว่า PostgreSQL รันอยู่
- ตรวจสอบ DATABASE_URL ใน `.env`

### Error: "JWT_SECRET must be at least 32 characters"
- แก้ไข JWT_SECRET ใน `.env` ให้ยาวพอ

### TypeScript errors ไม่หาย
1. Delete `node_modules` และ `package-lock.json`
2. Run `npm install`
3. Run `npx prisma generate`
4. Restart VS Code

## 📚 เอกสารเพิ่มเติม

- [README.md](./README.md) - เอกสารหลักของโปรเจกต์
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)

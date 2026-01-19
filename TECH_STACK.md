# Technology Stack

## Project Overview

โปรเจกต์นี้เป็นระบบ Backend API ที่พัฒนาด้วย TypeScript โดยมี 2 เวอร์ชัน:

1. **Server (Hono)** - เวอร์ชันหลักที่ใช้งานปัจจุบัน
2. **Express** - เวอร์ชันเก่าที่ยังคงอยู่ในโปรเจกต์

---

## 🚀 Main Stack (Hono Server)

### Core Framework

- **[Hono](https://hono.dev/)** `v4.11.4` - Web framework ที่เร็วและเบาสำหรับ Edge Computing
- **TypeScript** `v5.9.3` - Type-safe JavaScript
- **Node.js** - Runtime environment

### Database & ORM

- **[Prisma ORM](https://www.prisma.io/)** `v7.2.0` - Modern database toolkit
  - `@prisma/client` - Prisma Client
  - `@prisma/adapter-pg` - PostgreSQL adapter
- **PostgreSQL** - Relational database
- **pg** `v8.17.1` - PostgreSQL client for Node.js

### Authentication & Security

- **bcryptjs** `v3.0.3` - Password hashing
- **jsonwebtoken** `v9.0.3` - JWT authentication
- **hono-rate-limiter** `v0.5.3` - Rate limiting middleware
- **Zod** `v4.3.5` - Schema validation

### File Processing

- **ExcelJS** `v4.4.0` - Excel file generation and manipulation
- **PDFKit** `v0.17.2` - PDF document generation
- **@pdf-lib/fontkit** `v1.1.1` - Font handling for PDFs
- **xlsx** `v0.18.5` - Excel file parsing

### Utilities

- **node-cron** `v4.2.1` - Task scheduling
- **dotenv** `v17.2.3` - Environment variable management

### Development Tools

- **tsx** `v4.21.0` - TypeScript execution and watch mode
- **TypeScript** `v5.9.3` - TypeScript compiler

---

## 📦 Alternative Stack (Express Server)

### Core Framework

- **Express** `v5.1.0` - Traditional Node.js web framework
- **TypeScript** `v5.9.3`

### Database

- **pg** `v8.16.3` - PostgreSQL client
- **pg-camelcase** `v0.0.3` - Automatic camelCase conversion

### Authentication & Security

- **bcrypt** `v6.0.0` - Password hashing
- **jsonwebtoken** `v9.0.2` - JWT authentication
- **helmet** `v8.1.0` - Security headers
- **cors** `v2.8.5` - CORS middleware
- **csrf-csrf** `v4.0.3` - CSRF protection
- **express-rate-limit** `v8.2.1` - Rate limiting
- **cookie-parser** `v1.4.7` - Cookie parsing

### File Processing

- **ExcelJS** `v4.4.0` - Excel generation
- **PDFKit** `v0.17.2` - PDF generation
- **xlsx** `v0.18.5` - Excel parsing
- **multer** `v2.0.2` - File upload handling

### Utilities

- **node-cron** `v4.2.1` - Task scheduling
- **dayjs** `v1.11.19` - Date manipulation
- **winston** `v3.18.3` - Logging
- **winston-daily-rotate-file** `v5.0.0` - Log rotation

### Development Tools

- **ts-node-dev** `v2.0.0` - TypeScript development server

---

## 🗄️ Database Schema (Prisma)

### Models

1. **Department** - แผนก
2. **Section** - ส่วนงาน
3. **User** - ผู้ใช้งาน
4. **UserLog** - บันทึกการกระทำของผู้ใช้

### Enums

- **Status**: `active`, `inactive`
- **Role**: `USER`, `ADMIN`
- **ActionType**: `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`

---

## 📁 Project Structure

```
hono-test/
├── server/                 # Hono server (Main)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── lib/           # Utility libraries
│   │   ├── middleware/    # Middleware functions
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Validation schemas
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seeding
│   └── package.json
├── express/               # Express server (Legacy)
│   └── ...
└── MIGRATION_PLAN.md      # Migration documentation
```

---

## 🔧 Development Scripts

### Hono Server

```bash
npm run dev      # Start development server with watch mode
npm run build    # Build TypeScript to JavaScript
npm run start    # Start production server
```

### Prisma Commands

```bash
npx prisma migrate dev    # Run migrations in development
npx prisma migrate deploy # Deploy migrations to production
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Open Prisma Studio
npm run seed              # Seed database
```

---

## 🎯 Key Features

### API Capabilities

- ✅ User authentication & authorization (JWT)
- ✅ Role-based access control (RBAC)
- ✅ Department & Section management
- ✅ User management with activity logging
- ✅ Rate limiting for API protection
- ✅ Excel & PDF export functionality
- ✅ Scheduled tasks with cron jobs

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Token versioning for session management
- Rate limiting to prevent abuse
- Input validation with Zod schemas

---

## 📊 Migration Status

โปรเจกต์นี้กำลังอยู่ในช่วงการ migrate จาก Express + Raw SQL ไปยัง Hono + Prisma ORM

- ดูรายละเอียดใน `MIGRATION_PLAN.md`

---

## 🔗 Useful Links

- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

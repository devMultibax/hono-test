# Technology Stack

## Project Overview

โปรเจกต์นี้เป็นระบบ Full-Stack Web Application ที่พัฒนาด้วย TypeScript ประกอบด้วย:

- **Frontend** (`app/`) - React SPA
- **Backend** (`server/`) - Hono REST API

---

## 🖥️ Frontend (`app/`)

### Core Framework

- **[React](https://react.dev/)** `v19.2.0` - UI library
- **[Vite](https://vite.dev/)** `v7.3.1` - Build tool & dev server
- **TypeScript** `v5.9.3` - Type-safe JavaScript

### UI & Styling

- **[Mantine](https://mantine.dev/)** `v8.3.14` - Component library
  - `@mantine/core`, `@mantine/form`, `@mantine/hooks`
  - `@mantine/dates`, `@mantine/modals`, `@mantine/notifications`
- **[Tailwind CSS](https://tailwindcss.com/)** `v4.1.18` - Utility-first CSS
- **[@tabler/icons-react](https://tabler.io/icons)** `v3.36.1` - Icon set
- **[lucide-react](https://lucide.dev/)** `v0.563.0` - Icon set

### State Management & Data Fetching

- **[Zustand](https://zustand-demo.pmnd.rs/)** `v5.0.11` - Global state management
- **[TanStack Query](https://tanstack.com/query)** `v5.90.20` - Server state & caching
- **[Axios](https://axios-http.com/)** `v1.13.4` - HTTP client

### Routing

- **[React Router](https://reactrouter.com/)** `v7.13.0` - Client-side routing

### Tables

- **[TanStack Table](https://tanstack.com/table)** `v8.21.3` - Headless table

### Internationalization

- **[i18next](https://www.i18next.com/)** `v25.8.3` - Internationalization framework
- **[react-i18next](https://react.i18next.com/)** `v16.5.4` - React bindings

### Utilities

- **[dayjs](https://day.js.org/)** `v1.11.19` - Date manipulation
- **[clsx](https://github.com/lukeed/clsx)** `v2.1.1` - Conditional classnames
- **[class-variance-authority](https://cva.style/)** `v0.7.1` - Variant styles
- **[notiflix](https://notiflix.github.io/)** `v3.2.8` - Notifications & loading

### Testing

- **[Vitest](https://vitest.dev/)** `v4.0.18` - Test runner
- **[@testing-library/react](https://testing-library.com/)** `v16.3.2` - Component testing
- **[msw](https://mswjs.io/)** `v2.12.10` - API mocking

---

## 🚀 Backend (`server/`)

### Core Framework

- **[Hono](https://hono.dev/)** `v4.11.4` - Fast & lightweight web framework
- **TypeScript** `v5.9.3` - Type-safe JavaScript
- **Node.js** - Runtime environment

### Database & ORM

- **[Prisma ORM](https://www.prisma.io/)** `v7.2.0` - Modern database toolkit
  - `@prisma/client` - Prisma Client
  - `@prisma/adapter-pg` - PostgreSQL adapter
- **PostgreSQL** - Relational database
- **pg** `v8.17.1` - PostgreSQL client for Node.js

### API Documentation

- **[@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)** `v1.2.0` - OpenAPI schema generation
- **[@scalar/hono-api-reference](https://scalar.com/)** `v0.9.34` - Interactive API reference UI

### Authentication & Security

- **bcryptjs** `v3.0.3` - Password hashing
- **jsonwebtoken** `v9.0.3` - JWT authentication
- **hono-rate-limiter** `v0.5.3` - Rate limiting middleware
- **[Zod](https://zod.dev/)** `v4.3.5` - Schema validation

### File Processing

- **[ExcelJS](https://github.com/exceljs/exceljs)** `v4.4.0` - Excel file generation and manipulation
- **[PDFKit](https://pdfkit.org/)** `v0.17.2` - PDF document generation
- **@pdf-lib/fontkit** `v1.1.1` - Font handling for PDFs
- **xlsx** `v0.18.5` - Excel file parsing

### Logging

- **[pino](https://getpino.io/)** `v10.2.1` - High-performance logger
- **pino-pretty** `v13.1.3` - Pretty-print log formatter

### Utilities

- **node-cron** `v4.2.1` - Task scheduling
- **dotenv** `v17.2.3` - Environment variable management

### Development & Testing

- **tsx** `v4.21.0` - TypeScript execution and watch mode
- **[Vitest](https://vitest.dev/)** `v4.0.17` - Test runner
- **supertest** `v7.2.2` - HTTP integration testing

---

## 🗄️ Database Schema (Prisma)

### Models

1. **Department** - แผนก
2. **Section** - ส่วนงาน (belongs to Department)
3. **User** - ผู้ใช้งาน (belongs to Department & Section)
4. **UserLog** - บันทึกการกระทำของผู้ใช้
5. **SystemSetting** - การตั้งค่าระบบ (key-value store)

### Enums

- **Status**: `active`, `inactive`
- **Role**: `USER`, `ADMIN`
- **ActionType**: `CREATE`, `UPDATE`, `DELETE`, `RESET_PASSWORD`, `CHANGE_PASSWORD`

---

## 📁 Project Structure

```
hono-test/
├── app/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Shared UI components
│   │   ├── constants/     # App-wide constants
│   │   ├── contexts/      # React contexts
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── providers/     # App providers
│   │   ├── routes/        # Route definitions
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper utilities
│   └── package.json
├── server/                 # Backend (Hono + Prisma)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── lib/           # Utility libraries
│   │   ├── middleware/    # Middleware functions
│   │   ├── routes/        # API routes
│   │   ├── schemas/       # Zod/OpenAPI schemas
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── index.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Database seeding
│   ├── tests/             # Test suites (unit, integration, e2e)
│   └── package.json
└── docs/                  # Project documentation
```

---

## 🔧 Development Scripts

### Frontend (`app/`)

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run test             # Run tests (watch mode)
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage
```

### Backend (`server/`)

```bash
npm run dev              # Start development server with watch mode
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run test             # Run all tests
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run e2e tests
npm run test:coverage    # Run tests with coverage
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
- ✅ OpenAPI documentation with interactive UI

### Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Token versioning for session management
- Rate limiting to prevent abuse
- Input validation with Zod schemas

---

## 🔗 Useful Links

- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Mantine Documentation](https://mantine.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

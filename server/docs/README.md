# Hono API Server

API server สร้างด้วย Hono framework พร้อม Prisma ORM และ PostgreSQL

## Features

- ✅ Authentication (JWT with username-based login)
- ✅ Role-Based Access Control (USER, ADMIN)
- ✅ User Management (CRUD)
- ✅ Department Management (CRUD)
- ✅ Section Management (CRUD)
- ✅ User Activity Logging
- ✅ TypeScript
- ✅ Prisma ORM
- ✅ Input Validation (Zod)
- ✅ Error Handling
- ✅ CORS Support
- ✅ Request Logging
- ✅ Health Check Endpoints
- ✅ Service Layer Architecture
- ✅ Environment Variables Validation
- ✅ Permission Middleware

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── env.ts       # Environment validation
│   ├── lib/             # Utilities and helpers
│   │   ├── prisma.ts    # Prisma client
│   │   ├── errors.ts    # Custom error classes
│   │   └── response.ts  # Response helpers
│   ├── middleware/      # Middleware functions
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── permission.ts # Role-based access control
│   │   ├── cors.ts      # CORS configuration
│   │   ├── error-handler.ts  # Global error handler
│   │   └── logger.ts    # Request logger
│   ├── routes/          # Route handlers
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── user.routes.ts       # User routes
│   │   ├── department.routes.ts # Department routes
│   │   ├── section.routes.ts    # Section routes
│   │   └── health.routes.ts     # Health check routes
│   ├── schemas/         # Zod validation schemas
│   │   ├── user.ts      # User schemas
│   │   ├── department.ts # Department schemas
│   │   └── section.ts   # Section schemas
│   ├── services/        # Business logic
│   │   ├── auth.service.ts       # Auth service
│   │   ├── user.service.ts       # User service
│   │   ├── department.service.ts # Department service
│   │   └── section.service.ts    # Section service
│   ├── types/           # TypeScript types
│   │   └── index.ts     # Type definitions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL
- pnpm/npm/yarn

### Installation

1. Clone the repository and navigate to server directory

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials and JWT secret:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
PORT=3000
NODE_ENV=development
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

7. (Optional) Seed the database:
```bash
npx prisma db seed
```

## Running the Server

### Development mode:
```bash
npm run dev
```

### Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /` - API info
- `GET /health` - Health check
- `GET /health/db` - Database health check

### Authentication
- `POST /auth/register` - Register new user
  ```json
  {
    "username": "user01",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "departmentId": 1,
    "sectionId": 1,
    "email": "john@example.com",
    "tel": "0812345678",
    "role": "USER"
  }
  ```

- `POST /auth/login` - Login user
  ```json
  {
    "username": "user01",
    "password": "password123"
  }
  ```

### Departments (Protected Routes)
All routes require `Authorization: Bearer <token>` header

- `GET /departments` - Get all departments (USER, ADMIN)
- `GET /departments?include=true` - Get departments with relations
- `GET /departments/:id` - Get department by ID (USER, ADMIN)
- `POST /departments` - Create department (ADMIN only)
  ```json
  {
    "name": "IT Department"
  }
  ```
- `PUT /departments/:id` - Update department (ADMIN only)
  ```json
  {
    "name": "Updated Name",
    "status": "active"
  }
  ```
- `DELETE /departments/:id` - Delete department (ADMIN only)

### Sections (Protected Routes)
All routes require `Authorization: Bearer <token>` header

- `GET /sections` - Get all sections (USER, ADMIN)
- `GET /sections?include=true` - Get sections with relations
- `GET /sections?departmentId=1` - Get sections by department
- `GET /sections/:id` - Get section by ID (USER, ADMIN)
- `POST /sections` - Create section (ADMIN only)
  ```json
  {
    "departmentId": 1,
    "name": "Development"
  }
  ```
- `PUT /sections/:id` - Update section (ADMIN only)
  ```json
  {
    "name": "Updated Name",
    "status": "active"
  }
  ```
- `DELETE /sections/:id` - Delete section (ADMIN only)

### Users (Protected Routes)
All routes require `Authorization: Bearer <token>` header

- `GET /users` - Get all users (USER, ADMIN)
- `GET /users?include=true` - Get users with relations
- `GET /users/:id` - Get user by ID (USER, ADMIN)
- `PUT /users/:id` - Update user (ADMIN only)
  ```json
  {
    "firstName": "Updated Name",
    "lastName": "Updated Lastname",
    "email": "updated@example.com",
    "tel": "0898765432",
    "status": "active"
  }
  ```
- `DELETE /users/:id` - Delete user (ADMIN only)

## Database Schema

### Tables

**Department**
- id, name, status, createdAt, createdBy, updatedAt, updatedBy

**Section**
- id, departmentId (FK), name, status, createdAt, createdBy, updatedAt, updatedBy

**User**
- id, username (unique, 6 chars), password, firstName, lastName
- departmentId (FK), sectionId (FK, nullable)
- email, tel (10 digits), role (USER/ADMIN), status
- createdAt, createdBy, updatedAt, updatedBy, lastLoginAt

**UserLog**
- Logs all user actions (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- Stores snapshot of user data at the time of action

### Relationships
- Department → Sections (one-to-many)
- Department → Users (one-to-many)
- Section → Users (one-to-many)

## Role-Based Access Control

### Roles
- **USER**: Can view departments, sections, and users
- **ADMIN**: Full access (create, update, delete all resources)

### Permission Matrix

| Endpoint | USER | ADMIN |
|----------|------|-------|
| GET /departments | ✅ | ✅ |
| POST /departments | ❌ | ✅ |
| PUT /departments/:id | ❌ | ✅ |
| DELETE /departments/:id | ❌ | ✅ |
| GET /sections | ✅ | ✅ |
| POST /sections | ❌ | ✅ |
| PUT /sections/:id | ❌ | ✅ |
| DELETE /sections/:id | ❌ | ✅ |
| GET /users | ✅ | ✅ |
| PUT /users/:id | ❌ | ✅ |
| DELETE /users/:id | ❌ | ✅ |

## Error Handling

API ใช้ centralized error handling ที่จัดการกับ:
- Validation errors (Zod)
- Custom application errors
- Database errors
- Authentication errors
- 404 Not Found

Response format สำหรับ errors:
```json
{
  "error": "Error message",
  "details": {}  // Optional, contains additional error information
}
```

## Security Best Practices

- ✅ Password hashing ด้วย bcrypt
- ✅ JWT token authentication
- ✅ Environment variables validation
- ✅ Input validation ด้วย Zod
- ✅ CORS configuration
- ✅ Error messages ไม่เปิดเผยข้อมูลละเอียด
- ✅ Prisma prepared statements (SQL injection protection)

## Development

### Code Style
- ใช้ 2 spaces สำหรับ indentation
- ใช้ single quotes
- ใช้ semicolons
- ใช้ TypeScript strict mode

### Architecture
- **Routes**: จัดการ HTTP requests และ responses
- **Services**: Business logic และ data manipulation
- **Middleware**: Cross-cutting concerns (auth, logging, error handling)
- **Schemas**: Input validation
- **Types**: TypeScript type definitions

## License

MIT

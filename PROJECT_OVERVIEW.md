# Project Overview - Server

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Hono 4.11.4 |
| ORM | Prisma 7.2.0 |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| Validation | Zod 4.3.5 |
| Logging | Pino 10.2.1 |
| Testing | Vitest 4.0.17 |

---

## Folder Structure

```
server/src/
├── config/         # Environment configuration
├── lib/            # Core utilities (prisma, logger, errors, response)
├── middleware/     # Auth, CORS, CSRF, rate-limit, security headers
├── routes/         # API route handlers
├── services/       # Business logic layer
├── schemas/        # Zod validation schemas
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── index.ts        # Entry point
```

---

## Database Models

```
Department ─┬─> Section ─┬─> User
            └────────────┘

UserLog (audit trail)
```

**Enums:**
- `Status`: active | inactive
- `Role`: USER | ADMIN
- `ActionType`: CREATE | UPDATE | DELETE | LOGIN | LOGOUT

---

## Authentication Flow

1. **Login** - Validate credentials → Generate JWT → Store in HTTP-only cookie
2. **Auth Middleware** - Extract JWT → Verify → Set user context
3. **Logout** - Increment tokenVersion → Delete cookie

---

## Authorization Levels

| Level | Access |
|-------|--------|
| Public | /health, /auth/login, /auth/csrf-token |
| Authenticated | /users (GET), /auth/me |
| Admin Only | /users (CUD), /backup/*, /system-log/*, /database/* |

---

## API Endpoints

### Auth
```
POST   /auth/login              # Login
POST   /auth/logout             # Logout
GET    /auth/me                 # Get profile
PUT    /auth/me                 # Update profile
PUT    /auth/me/password        # Change password
GET    /auth/csrf-token         # Get CSRF token
```

### Users
```
GET    /users                   # List (paginated, filterable)
POST   /users                   # Create (admin)
GET    /users/:id               # Get detail
PUT    /users/:id               # Update (admin)
DELETE /users/:id               # Delete (admin)
GET    /users/export/excel      # Export Excel
GET    /users/export/pdf        # Export PDF
POST   /users/import            # Import Excel
```

### Organization
```
GET|POST         /departments
GET|PUT|DELETE   /departments/:id
GET|POST         /sections
GET|PUT|DELETE   /sections/:id
```

### Admin Operations
```
GET|POST         /backup                    # List/Create backup
POST             /backup/:filename/restore  # Restore
DELETE           /backup/:filename          # Delete
GET              /database/statistics       # DB stats
POST             /database/analyze          # Run ANALYZE
GET              /system-log                # View logs
DELETE           /system-log/cleanup        # Cleanup logs
GET              /user-logs                 # Audit trail
```

---

## Middleware Stack

```
Request → Security Headers → CORS → Logger → Rate Limit
       → [Route Middleware: Auth → CSRF → Permission]
       → Handler → Response
       → Error Handler (global catch)
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| XSS | CSP headers |
| CSRF | Token-based |
| Password | bcrypt (10 rounds) |
| JWT | 24h expiry, HTTP-only cookie |
| Rate Limit | IP-based (login: 5/15min, general: 100/15min) |
| Input Validation | Zod on all endpoints |

---

## Scheduled Tasks

| Task | Schedule | Action |
|------|----------|--------|
| Auto Backup | Daily 02:00 | pg_dump with 30-day retention |
| Log Cleanup | Periodic | Remove old log files |

---

## Environment Variables

```env
DATABASE_URL        # PostgreSQL connection (required)
JWT_SECRET          # 32-256 chars (required)
JWT_COOKIE_NAME     # Default: 'auth_token'
PORT                # Default: 3000
NODE_ENV            # development | production | test
PG_BIN_PATH         # Path to pg_dump/psql
```

---

## Response Format

```json
// Success
{ "data": { ... } }

// Success with pagination
{
  "data": [...],
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}

// Error
{ "error": "message", "details": { ... } }
```

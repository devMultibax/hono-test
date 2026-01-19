# API Documentation Security

## 🔒 ระดับความปลอดภัย

API Documentation (`/docs` และ `/openapi.json`) ถูกตั้งค่าให้แสดงเฉพาะใน **Development** และ **Test** environments เท่านั้น

## 📊 สรุปการเข้าถึง

| Environment | `/docs` | `/openapi.json` | สถานะ |
|-------------|---------|-----------------|-------|
| `development` | ✅ เข้าถึงได้ | ✅ เข้าถึงได้ | พร้อมใช้งาน |
| `test` | ✅ เข้าถึงได้ | ✅ เข้าถึงได้ | พร้อมใช้งาน |
| `production` | ❌ 404 Not Found | ❌ 404 Not Found | ปิดการใช้งาน |

## 🛡️ เหตุผลด้านความปลอดภัย

การปิด API Documentation ใน production ป้องกัน:

1. **Information Disclosure** - ไม่เปิดเผยโครงสร้าง API ให้ผู้ไม่ประสงค์ดี
2. **Attack Surface Reduction** - ลดพื้นที่ที่อาจถูกโจมตี
3. **Enumeration Prevention** - ป้องกันการสำรวจ endpoints
4. **Security Through Obscurity** - ทำให้ยากต่อการวางแผนโจมตี

## ⚙️ การตั้งค่า

### Development Mode (แสดง Documentation)
```bash
NODE_ENV=development npm run dev
# เข้าถึง: http://localhost:3000/docs ✅
```

### Test Mode (แสดง Documentation)
```bash
NODE_ENV=test npm run dev
# เข้าถึง: http://localhost:3000/docs ✅
```

### Production Mode (ซ่อน Documentation)
```bash
NODE_ENV=production npm start
# เข้าถึง: http://localhost:3000/docs ❌ 404 Not Found
```

## 📝 Implementation Details

ดูใน `server/src/lib/openapi.ts`:

```typescript
export const registerOpenAPIRoutes = (app: Hono) => {
  const isDevelopmentOrTest = env.NODE_ENV === 'development' || env.NODE_ENV === 'test'

  if (isDevelopmentOrTest) {
    // เปิดใช้งาน API Documentation
    app.get('/openapi.json', (c) => c.json(OPENAPI_INFO))
    app.get('/docs', Scalar(SCALAR_CONFIG))
  } else {
    // Production: ส่งกลับ 404
    app.get('/openapi.json', (c) => c.json({ error: 'Not Found' }, 404))
    app.get('/docs', (c) => c.json({ error: 'Not Found' }, 404))
  }
}
```

## 🔐 Best Practices เพิ่มเติม

หากต้องการความปลอดภัยเพิ่มเติม สามารถเพิ่ม:

### 1. IP Whitelist (Development Only)
```typescript
const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
app.get('/docs', (c, next) => {
  const clientIP = c.req.header('x-forwarded-for') || c.req.raw.headers.get('cf-connecting-ip')
  if (!allowedIPs.includes(clientIP)) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  return next()
}, Scalar(SCALAR_CONFIG))
```

### 2. Basic Authentication
```typescript
import { basicAuth } from 'hono/basic-auth'

app.get('/docs',
  basicAuth({ username: 'admin', password: 'secret' }),
  Scalar(SCALAR_CONFIG)
)
```

### 3. Rate Limiting (ป้องกัน DoS)
```typescript
import { rateLimiter } from 'hono-rate-limiter'

app.get('/docs',
  rateLimiter({ windowMs: 60000, max: 10 }),
  Scalar(SCALAR_CONFIG)
)
```

## ⚠️ สำคัญ

- **NEVER** เปิด API Documentation ใน production environment
- ตรวจสอบให้แน่ใจว่า `NODE_ENV=production` ถูกตั้งค่าอย่างถูกต้องบน production server
- ใช้ HTTPS ใน production เสมอ (ตั้งค่า `COOKIE_SECURE=true`)

## 📚 Related Files

- `server/src/lib/openapi.ts` - Main configuration
- `server/src/lib/openapi-paths.ts` - API endpoints definitions
- `server/src/lib/openapi-schemas.ts` - Data models definitions
- `server/src/middleware/security-headers.ts` - Security headers with relaxed CSP for /docs

## 🧪 Testing

```bash
# Test Development Mode
NODE_ENV=development npm run dev
curl http://localhost:3000/docs
# Expected: 200 OK (Scalar UI)

# Test Production Mode
NODE_ENV=production npm run dev
curl http://localhost:3000/docs
# Expected: 404 Not Found
```

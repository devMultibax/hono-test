---
name: generate-db-model
description: Generate a database model/entity following project conventions (audit fields, status, indexes, table mapping). Supports Prisma, Drizzle, TypeORM, and other ORMs.
disable-model-invocation: true
user-invocable: true
argument-hint: [model-name]
---

# Generate Database Model

Generate a database model for: **$ARGUMENTS**

## Pre-flight

1. Read `!cat .claude/skills/_foundation/detection.md` — detect the project's ORM
2. Read `!cat .claude/skills/_foundation/philosophy.md` — review data modeling conventions
3. Find and read the existing schema/model files to understand current conventions
4. Ask the user what fields the model needs if not provided
5. Determine relations to existing models

## Abstract Specification

Every domain model must include:

### Structure

| Section | Fields |
|---------|--------|
| **ID** | Auto-increment integer (UUID only if explicitly requested) |
| **Business fields** | Domain-specific fields (name, description, etc.) |
| **Status** | Enum (`active`/`inactive`), default `active` |
| **Audit fields** | `createdAt`, `createdBy`, `createdByName`, `updatedAt`, `updatedBy`, `updatedByName` |
| **Relations** | Foreign keys to parent models, reverse relations from children |
| **Indexes** | On `status`, `createdAt`, all FK fields, frequently queried fields |
| **Table mapping** | `snake_case` singular name |

### Audit Fields (mandatory for all domain models)

| Field | Type | On Create | On Update |
|-------|------|-----------|-----------|
| `createdAt` | DateTime | Auto `now()` | Unchanged |
| `createdBy` | String(100) | Username | Unchanged |
| `createdByName` | String(200) | Full name, default `""` | Unchanged |
| `updatedAt` | DateTime? | `null` | Current time |
| `updatedBy` | String?(100) | `null` | Username |
| `updatedByName` | String?(200) | `null` | Full name |

### Field Type Guidelines

| Data Type | Max Length | Example |
|-----------|-----------|---------|
| Short text | 100 | `name` |
| Medium text | 200 | `createdByName` |
| Email/URL | 255 | `email` |
| Long text | 500 | `description` |
| Unlimited | Text | `content` |
| Fixed length | Char(N) | `username Char(6)` |

### Relations

| Delete Strategy | When to Use | Example |
|----------------|------------|---------|
| Cascade | Parent owns children (delete together) | Department → Sections |
| Restrict | Prevent delete if children exist | Department → Users |
| SetNull | Optional FK, set to null on delete | Section → Users |

### Unique Constraints

- Simple: unique annotation on the field
- Composite: unique constraint on field combination (e.g., name unique within parent)

### Enums

Reuse existing enums when possible. If a new enum is needed, define it alongside the model.

## ORM-Specific Guidance

### If Prisma

Add to `schema.prisma`:

```prisma
model Entity {
  id            Int       @id @default(autoincrement())

  // ─── Business Fields ───
  name          String    @unique @db.VarChar(100)
  status        Status    @default(active)

  // ─── Audit Fields ───
  createdAt     DateTime  @default(now())
  createdBy     String    @db.VarChar(100)
  createdByName String    @default("") @db.VarChar(200)
  updatedAt     DateTime?
  updatedBy     String?   @db.VarChar(100)
  updatedByName String?   @db.VarChar(200)

  // ─── Relations ───
  // parentId    Int
  // parent      Parent   @relation(fields: [parentId], references: [id], onDelete: Cascade)
  // children    Child[]

  // ─── Indexes ───
  @@index([status])
  @@index([createdAt])

  @@map("entity_snake_case")
}
```

After adding: `npx prisma migrate dev --name add_{entity}_table` then `npx prisma generate`

### If Drizzle

Add to schema file:

```typescript
import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const entityTable = pgTable('entity_snake_case', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  status: statusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 100 }).notNull(),
  createdByName: varchar('created_by_name', { length: 200 }).default('').notNull(),
  updatedAt: timestamp('updated_at'),
  updatedBy: varchar('updated_by', { length: 100 }),
  updatedByName: varchar('updated_by_name', { length: 200 }),
}, (table) => ({
  statusIdx: index('entity_status_idx').on(table.status),
  createdAtIdx: index('entity_created_at_idx').on(table.createdAt),
}))
```

After adding: generate migration with `drizzle-kit generate` then `drizzle-kit push` or `drizzle-kit migrate`

### If TypeORM

Create entity class:

```typescript
@Entity('entity_snake_case')
export class EntityModel {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string

  @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
  status: Status

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'varchar', length: 100 })
  createdBy: string

  @Column({ type: 'varchar', length: 200, default: '' })
  createdByName: string

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date | null

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null

  @Column({ type: 'varchar', length: 200, nullable: true })
  updatedByName: string | null

  @Index()
  @ManyToOne(() => ParentEntity, { onDelete: 'CASCADE' })
  parent: ParentEntity
}
```

After adding: generate migration with `typeorm migration:generate` then `typeorm migration:run`

## After Adding the Model

1. Add **backend types** — response interface for the entity
2. Add **frontend types** — matching interface
3. Add **test mock** — mock model methods for the ORM client
4. Run **migration** — apply the schema change
5. Regenerate **ORM client** (if applicable, e.g., `prisma generate`)

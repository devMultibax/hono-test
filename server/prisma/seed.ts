import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

// --- Constants ---

const SEED_ACTOR = 'SYSTEM'
const BCRYPT_ROUNDS = 10

const DEPARTMENT_NAMES = [
  'STD', 'ST', 'SE', 'SAF', 'PD5', 'PD3', 'PD2', 'PD1', 'PD', 'PC',
  'PA', 'MT5', 'MT3', 'MT2', 'MT1', 'FN', 'EN', 'BIO', 'ADM', 'AC',
  'QC', 'PN', 'IT'
]

const SECTION_DATA = [
  { dept: 'ADM', sections: ['ADMIN'] },
  { dept: 'PD1', sections: ['1/1', '1/2', '1/3'] },
  { dept: 'PD2', sections: ['2/1', '2/2', '2/3'] },
  { dept: 'PD3', sections: ['3/1', '3/2', '3/3', '3/4'] },
  { dept: 'PD5', sections: ['5/2'] },
  { dept: 'QC',  sections: ['QC', 'QC1', 'QC2', 'QC3', 'QC5', 'LAB', 'FG', 'CBT'] },
  { dept: 'ST',  sections: ['DR&FG', 'PF', 'RM&EM'] }
]

const SYSTEM_SETTINGS = [
  {
    key: 'maintenance_mode',
    value: 'false',
    description: 'เปิด/ปิดโหมดปิดปรับปรุงระบบ'
  },
  {
    key: 'maintenance_message',
    value: 'ระบบปิดปรับปรุงชั่วคราว กรุณาลองใหม่ภายหลัง',
    description: 'ข้อความแจ้งเตือนเมื่อระบบปิดปรับปรุง'
  }
]

// --- Setup ---

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// --- Seed functions ---

async function seedDepartments(): Promise<void> {
  console.log('📦 Seeding departments...')

  for (const name of DEPARTMENT_NAMES) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, status: 'active', createdBy: SEED_ACTOR }
    })
  }

  console.log(`✅ Seeded ${DEPARTMENT_NAMES.length} departments`)
}

async function seedSections(): Promise<void> {
  console.log('📦 Seeding sections...')
  let count = 0

  for (const { dept, sections } of SECTION_DATA) {
    const department = await prisma.department.findUnique({ where: { name: dept } })
    if (!department) continue

    for (const name of sections) {
      await prisma.section.upsert({
        where: { departmentId_name: { departmentId: department.id, name } },
        update: {},
        create: { departmentId: department.id, name, status: 'active', createdBy: SEED_ACTOR }
      })
      count++
    }
  }

  console.log(`✅ Seeded ${count} sections`)
}

async function seedAdminUser(): Promise<void> {
  console.log('👤 Seeding admin user...')

  const itDepartment = await prisma.department.findUnique({ where: { name: 'IT' } })
  if (!itDepartment) {
    console.warn('⚠️  IT department not found, skipping admin user seed')
    return
  }

  // Pre-hashed value for 'password'
  const hashedPassword = '$2b$10$BoqEuTw/adlgdaHcleYJ6.oyiGkSeIJTU/eXo3etUpySdmw50E8bi'

  await prisma.user.upsert({
    where: { username: '682732' },
    update: {},
    create: {
      username: '682732',
      password: hashedPassword,
      firstName: 'ดิษกรณ์',
      lastName: 'นิสกุลทอง',
      departmentId: itDepartment.id,
      email: 'it-pro@multibax.com',
      tel: '0987654321',
      role: 'ADMIN',
      status: 'active',
      createdBy: SEED_ACTOR
    }
  })

  console.log('✅ Seeded admin user (username: 682732)')
}

async function seedSystemSettings(): Promise<void> {
  console.log('⚙️  Seeding system settings...')

  for (const setting of SYSTEM_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }

  console.log(`✅ Seeded ${SYSTEM_SETTINGS.length} system settings`)
}

// --- Entry point ---

async function main(): Promise<void> {
  console.log('🌱 Starting seed...')

  await seedDepartments()
  await seedSections()
  await seedAdminUser()
  await seedSystemSettings()

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin: username=682732, password=(from hash)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

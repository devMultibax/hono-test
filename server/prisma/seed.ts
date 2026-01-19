import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Seed Departments
  console.log('📦 Seeding departments...')
  const departments = [
    'STD', 'ST', 'SE', 'SAF', 'PD5', 'PD3', 'PD2', 'PD1', 'PD', 'PC',
    'PA', 'MT5', 'MT3', 'MT2', 'MT1', 'FN', 'EN', 'BIO', 'ADM', 'AC',
    'QC', 'PN', 'IT'
  ]

  for (const name of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: {
        name,
        status: 'active',
        createdBy: 'SYSTEM'
      }
    })
  }
  console.log(`✅ Created ${departments.length} departments`)

  // 2. Seed Sections
  console.log('📦 Seeding sections...')

  const sections = [
    // ADM
    { dept: 'ADM', sections: ['ADMIN'] },

    // PD1
    { dept: 'PD1', sections: ['1/1', '1/2', '1/3'] },

    // PD2
    { dept: 'PD2', sections: ['2/1', '2/2', '2/3'] },

    // PD3
    { dept: 'PD3', sections: ['3/1', '3/2', '3/3', '3/4'] },

    // PD5
    { dept: 'PD5', sections: ['5/2'] },

    // QC
    { dept: 'QC', sections: ['QC', 'QC1', 'QC2', 'QC3', 'QC5', 'LAB', 'FG', 'CBT'] },

    // ST
    { dept: 'ST', sections: ['DR&FG', 'PF', 'RM&EM'] }
  ]

  let sectionCount = 0
  for (const { dept, sections: sectionNames } of sections) {
    const department = await prisma.department.findUnique({
      where: { name: dept }
    })

    if (department) {
      for (const sectionName of sectionNames) {
        await prisma.section.upsert({
          where: {
            departmentId_name: {
              departmentId: department.id,
              name: sectionName
            }
          },
          update: {},
          create: {
            departmentId: department.id,
            name: sectionName,
            status: 'active',
            createdBy: 'SYSTEM'
          }
        })
        sectionCount++
      }
    }
  }
  console.log(`✅ Created ${sectionCount} sections`)

  // 3. Seed Admin User
  console.log('👤 Seeding admin user...')

  const itDepartment = await prisma.department.findUnique({
    where: { name: 'IT' }
  })

  if (itDepartment) {
    // Password จากไฟล์เดิม (password: 'password' หรือ '123456')
    const hashedPassword = '$2b$10$BoqEuTw/adlgdaHcleYJ6.oyiGkSeIJTU/eXo3etUpySdmw50E8bi'

    await prisma.user.upsert({
      where: { username: '682732' },
      update: {},
      create: {
        username: '682732',
        password: hashedPassword,
        firstName: 'Disakorn',
        lastName: 'Nisakuntong',
        departmentId: itDepartment.id,
        email: 'it-pro@multibax.com',
        tel: '0987654321',
        role: 'ADMIN',
        status: 'active',
        createdBy: 'SYSTEM'
      }
    })
    console.log('✅ Created admin user (username: 682732)')
  }

  // 4. Create additional test users (optional)
  console.log('👥 Creating test users...')

  const admDepartment = await prisma.department.findUnique({
    where: { name: 'ADM' }
  })

  const adminSection = await prisma.section.findFirst({
    where: {
      departmentId: admDepartment?.id,
      name: 'ADMIN'
    }
  })

  if (admDepartment && adminSection) {
    // Test USER account
    const testUserPassword = await bcrypt.hash('test123', 10)

    await prisma.user.upsert({
      where: { username: 'test01' },
      update: {},
      create: {
        username: 'test01',
        password: testUserPassword,
        firstName: 'Test',
        lastName: 'User',
        departmentId: admDepartment.id,
        sectionId: adminSection.id,
        email: 'test@multibax.com',
        tel: '0811111111',
        role: 'USER',
        status: 'active',
        createdBy: 'SYSTEM'
      }
    })
    console.log('✅ Created test user (username: test01, password: test123)')
  }

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin: username=682732, password=(from hash)')
  console.log('   User:  username=test01, password=test123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

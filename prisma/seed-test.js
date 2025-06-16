import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      email: 'contact@testcompany.com',
    },
  })

  console.log(`Created company: ${company.name}`)

  // Create admin role
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      company_id: company.id
    },
  })

  console.log(`Created role: ${adminRole.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

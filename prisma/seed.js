/**
 * Placeholder Prisma seed script.
 * After installing Prisma and generating the client, replace this with real seed logic.
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // TODO: implement seed data matching current demo data
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const prismaSchemaPath = path.resolve(__dirname, '../prisma/schema.prisma')

process.env.PRISMA_SCHEMA_PATH = prismaSchemaPath
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library'

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
})

export default prisma

import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const toPrismaFileUrl = (absolutePath) => {
  return `file:${absolutePath.replace(/\\/g, '/')}`
}

const resolveDatabaseUrl = () => {
  const configuredUrl = process.env.DATABASE_URL
  if (configuredUrl && configuredUrl.startsWith('file:')) {
    const relativePath = configuredUrl.replace(/^file:/, '')
    if (relativePath.startsWith('./') || relativePath.startsWith('../')) {
      const absolutePath = path.resolve(process.cwd(), relativePath)
      return toPrismaFileUrl(absolutePath)
    }
    if (/^\/\//.test(relativePath) || /^[A-Za-z]:\//.test(relativePath)) {
      return toPrismaFileUrl(relativePath)
    }
    return configuredUrl
  }

  const absolutePath = path.resolve(process.cwd(), 'data', 'urmis-prisma.db')
  return toPrismaFileUrl(absolutePath)
}

process.env.DATABASE_URL = resolveDatabaseUrl()

const prisma = new PrismaClient()
export default prisma

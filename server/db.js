import prisma from './prisma.js'

export const initializeDatabase = async () => {
  await prisma.$connect()
}

export const getPrisma = () => prisma

export default prisma

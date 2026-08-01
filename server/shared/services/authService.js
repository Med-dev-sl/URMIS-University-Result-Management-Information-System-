import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../../prisma.js'

const accessSecret = process.env.JWT_SECRET || 'urmis-access-secret'
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'urmis-refresh-secret'
const accessExpiry = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

function normalizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    created_at: user.created_at,
  }
}

function buildTokenPayload(user) {
  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    institutionId: user.institutionId,
  }
}

function generateAccessToken(user) {
  return jwt.sign(buildTokenPayload(user), accessSecret, {
    expiresIn: accessExpiry,
  })
}

function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id }, refreshSecret, {
    expiresIn: refreshExpiry,
  })
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

async function verifyPassword(password, hashed) {
  return bcrypt.compare(password, hashed)
}

export default {
  async register({ full_name, email, password, institutionId = null, role = 'student' }) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('Email is already registered.')
    }

    const password_hash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
        role,
        institutionId,
      },
    })

    return normalizeUser(user)
  },

  async verifyCredentials(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return null
    }

    const validPassword = await verifyPassword(password, user.password_hash)
    if (!validPassword) {
      return null
    }

    return normalizeUser(user)
  },

  generateAccessToken,
  generateRefreshToken,

  async saveRefreshToken(userId, refreshToken) {
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    })
  },

  async revokeRefreshToken(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refresh_token: null },
    })
  },

  async refreshTokens(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, refreshSecret)
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user || user.refresh_token !== refreshToken) {
        return null
      }

      return normalizeUser(user)
    } catch {
      return null
    }
  },

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    return user ? normalizeUser(user) : null
  },
}

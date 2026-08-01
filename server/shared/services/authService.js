import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import prisma from '../../prisma.js'

const accessSecret = process.env.JWT_SECRET || 'urmis-access-secret'
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'urmis-refresh-secret'
const accessExpiry = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
const lockoutThreshold = Number(process.env.AUTH_LOCKOUT_THRESHOLD || 5)
const lockoutDurationMs = Number(process.env.AUTH_LOCKOUT_DURATION_MINUTES || 15) * 60000
const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
const cookieConfig = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
}

function normalizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    institutionId: user.institutionId,
    emailVerified: Boolean(user.email_verified),
    created_at: user.created_at,
    updated_at: user.updated_at,
    lastLoginAt: user.last_login_at,
    isSuspended: Boolean(user.isSuspended),
    isLocked: Boolean(user.isLocked),
    mustChangePassword: Boolean(user.mustChangePassword),
  }
}

async function ensureAuthSchema() {
  try {
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'`
    if (!tables.length) {
      return
    }

    const columns = await prisma.$queryRaw`PRAGMA table_info('User')`
    const names = new Set(columns.map((column) => column.name))
    const additions = [
      ['email_verified', 'BOOLEAN NOT NULL DEFAULT 0'],
      ['email_verification_token', 'TEXT'],
      ['email_verification_expires', 'DATETIME'],
      ['password_reset_token', 'TEXT'],
      ['password_reset_expires', 'DATETIME'],
      ['failed_login_attempts', 'INTEGER NOT NULL DEFAULT 0'],
      ['locked_until', 'DATETIME'],
      ['last_login_at', 'DATETIME'],
      ['refresh_token_version', 'INTEGER NOT NULL DEFAULT 0'],
    ]

    for (const [name, definition] of additions) {
      if (!names.has(name)) {
        await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN ${name} ${definition}`)
      }
    }

    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS token_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_type TEXT NOT NULL,
      jti TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(jti, token_type)
    )`)
  } catch {
    // Continue with default behavior if the schema bootstrap is unavailable.
  }
}

function buildTokenPayload(user, type) {
  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    institutionId: user.institutionId,
    type,
    jti: randomUUID(),
    iss: 'urmis',
  }
}

function generateAccessToken(user) {
  return jwt.sign(buildTokenPayload(user, 'access'), accessSecret, {
    expiresIn: accessExpiry,
    issuer: 'urmis',
  })
}

function generateRefreshToken(user) {
  return jwt.sign(buildTokenPayload(user, 'refresh'), refreshSecret, {
    expiresIn: refreshExpiry,
    issuer: 'urmis',
  })
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

async function hashToken(token) {
  return bcrypt.hash(token, 10)
}

async function verifyPassword(password, hashed) {
  return bcrypt.compare(password, hashed)
}

async function verifyToken(token, hashedToken) {
  return bcrypt.compare(token, hashedToken)
}

async function getUserByEmail(email) {
  const rows = await prisma.$queryRaw`SELECT id, institutionId, full_name, email, password_hash, refresh_token, role, isSuspended, isLocked, mustChangePassword, created_at, updated_at, email_verified, email_verification_token, email_verification_expires, password_reset_token, password_reset_expires, failed_login_attempts, locked_until, last_login_at, refresh_token_version FROM User WHERE email = ${email} LIMIT 1`
  return rows[0] || null
}

async function getUserById(id) {
  const rows = await prisma.$queryRaw`SELECT id, institutionId, full_name, email, password_hash, refresh_token, role, isSuspended, isLocked, mustChangePassword, created_at, updated_at, email_verified, email_verification_token, email_verification_expires, password_reset_token, password_reset_expires, failed_login_attempts, locked_until, last_login_at, refresh_token_version FROM User WHERE id = ${Number(id)} LIMIT 1`
  return rows[0] || null
}

async function setUserFields(userId, fields) {
  const assignments = Object.entries(fields)
    .map(([key]) => `${key} = ?`)
    .join(', ')
  const values = Object.values(fields)
  await prisma.$executeRawUnsafe(`UPDATE User SET ${assignments} WHERE id = ?`, ...values, userId)
}

async function setRefreshToken(userId, refreshTokenHash) {
  await setUserFields(userId, {
    refresh_token: refreshTokenHash,
    refresh_token_version: Number((await getUserById(userId)).refresh_token_version || 0) + 1,
  })
}

async function clearRefreshToken(userId) {
  await setUserFields(userId, {
    refresh_token: null,
  })
}

async function markLoginFailure(userId, attempts, lockedUntil) {
  await setUserFields(userId, {
    failed_login_attempts: attempts,
    locked_until: lockedUntil,
  })
}

async function markLoginSuccess(userId) {
  await setUserFields(userId, {
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: new Date().toISOString(),
  })
}

async function markPasswordReset(userId, hashedToken, expiresAt) {
  await setUserFields(userId, {
    password_reset_token: hashedToken,
    password_reset_expires: expiresAt.toISOString(),
  })
}

async function clearPasswordReset(userId) {
  await setUserFields(userId, {
    password_reset_token: null,
    password_reset_expires: null,
  })
}

async function markEmailVerification(userId, hashedToken, expiresAt) {
  await setUserFields(userId, {
    email_verification_token: hashedToken,
    email_verification_expires: expiresAt.toISOString(),
  })
}

async function markEmailVerified(userId) {
  await setUserFields(userId, {
    email_verified: 1,
    email_verification_token: null,
    email_verification_expires: null,
  })
}

async function updatePassword(userId, passwordHash) {
  await setUserFields(userId, {
    password_hash: passwordHash,
  })
}

async function blacklistToken(userId, token, type) {
  try {
    const payload = jwt.decode(token)
    if (!payload?.jti) {
      return
    }

    const expiresAt = payload.exp ? new Date(payload.exp * 1000).toISOString() : new Date(Date.now() + 1000 * 60 * 60).toISOString()
    await prisma.$executeRawUnsafe(`INSERT OR IGNORE INTO token_blacklist (user_id, token_type, jti, expires_at) VALUES (?, ?, ?, ?)`, userId, type, payload.jti, expiresAt)
  } catch {
    // Ignore blacklist failures and continue.
  }
}

async function isTokenBlacklisted(jti, type) {
  try {
    const rows = await prisma.$queryRawUnsafe(`SELECT 1 FROM token_blacklist WHERE jti = ? AND token_type = ? LIMIT 1`, jti, type)
    return rows.length > 0
  } catch {
    return false
  }
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, { ...cookieConfig, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...cookieConfig, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', cookieConfig)
  res.clearCookie('refreshToken', cookieConfig)
}

function getTokenFromRequest(req, type = 'access') {
  const headerToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null
  if (headerToken) {
    return headerToken
  }

  const cookies = Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .filter(Boolean)
      .map((part) => {
        const [key, ...valueParts] = part.trim().split('=')
        return [key, valueParts.join('=')]
      }),
  )

  return type === 'refresh' ? cookies.refreshToken : cookies.accessToken
}

export default {
  async register({ full_name, email, password, institutionId = null, role = 'student' }) {
    await ensureAuthSchema()

    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new Error('Email is already registered.')
    }

    const passwordHash = await hashPassword(password)
    const verificationToken = randomUUID()
    const verificationTokenHash = await hashToken(verificationToken)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
    const now = new Date().toISOString()

    await prisma.$executeRawUnsafe(`INSERT INTO User (full_name, email, password_hash, role, institutionId, email_verified, email_verification_token, email_verification_expires, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?)`, full_name, email, passwordHash, String(role || 'student').toLowerCase(), institutionId, verificationTokenHash, expiresAt.toISOString(), now, now)

    const createdUser = await getUserByEmail(email)
    const accessToken = generateAccessToken(createdUser)
    const refreshToken = generateRefreshToken(createdUser)
    await setRefreshToken(createdUser.id, await hashToken(refreshToken))

    return {
      user: normalizeUser(createdUser),
      accessToken,
      refreshToken,
      verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken,
    }
  },

  async verifyCredentials(email, password) {
    await ensureAuthSchema()

    const userRow = await getUserByEmail(email)
    if (!userRow) {
      return { user: null, reason: 'invalid_credentials' }
    }

    if (userRow.isSuspended || userRow.isLocked) {
      return { user: null, reason: 'account_disabled' }
    }

    const lockedUntil = userRow.locked_until ? new Date(userRow.locked_until) : null
    if (lockedUntil && lockedUntil > new Date()) {
      return { user: null, reason: 'account_locked' }
    }

    const validPassword = await verifyPassword(password, userRow.password_hash)
    if (!validPassword) {
      const nextAttempts = Number(userRow.failed_login_attempts || 0) + 1
      const shouldLock = nextAttempts >= lockoutThreshold
      const lockTime = shouldLock ? new Date(Date.now() + lockoutDurationMs).toISOString() : null
      await markLoginFailure(userRow.id, nextAttempts, lockTime)
      return { user: null, reason: shouldLock ? 'account_locked' : 'invalid_credentials' }
    }

    if (requireEmailVerification && !userRow.email_verified) {
      return { user: null, reason: 'email_not_verified' }
    }

    await markLoginSuccess(userRow.id)
    return { user: userRow, reason: null }
  },

  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  getTokenFromRequest,
  async saveRefreshToken(userId, refreshToken) {
    await ensureAuthSchema()
    await setRefreshToken(userId, await hashToken(refreshToken))
  },

  async revokeRefreshToken(userId) {
    await ensureAuthSchema()
    await clearRefreshToken(userId)
  },

  async blacklistToken(userId, token, type) {
    await ensureAuthSchema()
    await blacklistToken(userId, token, type)
  },

  async verifyAccessToken(token) {
    return jwt.verify(token, accessSecret, { issuer: 'urmis' })
  },

  async verifyRefreshToken(token) {
    return jwt.verify(token, refreshSecret, { issuer: 'urmis' })
  },

  async refreshTokens(refreshToken) {
    await ensureAuthSchema()
    try {
      const payload = await this.verifyRefreshToken(refreshToken)
      const userRow = await getUserById(payload.userId)
      if (!userRow || !userRow.refresh_token) {
        return null
      }

      const isValidRefreshToken = await verifyToken(refreshToken, userRow.refresh_token)
      if (!isValidRefreshToken) {
        return null
      }

      const blacklisted = await isTokenBlacklisted(payload.jti, 'refresh')
      if (blacklisted) {
        return null
      }

      const newAccessToken = generateAccessToken(userRow)
      const newRefreshToken = generateRefreshToken(userRow)
      await setRefreshToken(userRow.id, await hashToken(newRefreshToken))
      await blacklistToken(userRow.id, refreshToken, 'refresh')

      return {
        user: userRow,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }
    } catch {
      return null
    }
  },

  async verifyEmail(token) {
    await ensureAuthSchema()
    const userRows = await prisma.$queryRaw`SELECT id, email_verification_token, email_verification_expires FROM User WHERE email_verification_token IS NOT NULL`
    for (const user of userRows) {
      if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
        continue
      }
      if (await verifyToken(token, user.email_verification_token)) {
        await markEmailVerified(user.id)
        return true
      }
    }
    return false
  },

  async requestPasswordReset(email) {
    await ensureAuthSchema()
    const userRow = await getUserByEmail(email)
    if (!userRow) {
      return null
    }

    const resetToken = randomUUID()
    const resetTokenHash = await hashToken(resetToken)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)
    await markPasswordReset(userRow.id, resetTokenHash, expiresAt)
    return { resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken, expiresAt }
  },

  async resetPassword(token, password) {
    await ensureAuthSchema()
    const userRows = await prisma.$queryRaw`SELECT id, password_reset_token, password_reset_expires FROM User WHERE password_reset_token IS NOT NULL`

    for (const user of userRows) {
      if (user.password_reset_expires && new Date(user.password_reset_expires) < new Date()) {
        continue
      }
      if (await verifyToken(token, user.password_reset_token)) {
        const passwordHash = await hashPassword(password)
        await updatePassword(user.id, passwordHash)
        await clearPasswordReset(user.id)
        await clearRefreshToken(user.id)
        return true
      }
    }

    return false
  },

  async resendVerification(email) {
    await ensureAuthSchema()
    const userRow = await getUserByEmail(email)
    if (!userRow) {
      return null
    }

    const verificationToken = randomUUID()
    const verificationHash = await hashToken(verificationToken)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)
    await markEmailVerification(userRow.id, verificationHash, expiresAt)
    return { verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken, expiresAt }
  },

  async getUserById(id) {
    await ensureAuthSchema()
    const userRow = await getUserById(id)
    return userRow ? normalizeUser(userRow) : null
  },

  async getUserByEmail(email) {
    await ensureAuthSchema()
    const userRow = await getUserByEmail(email)
    return userRow ? normalizeUser(userRow) : null
  },
}

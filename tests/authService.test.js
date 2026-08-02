import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, rm } from 'node:fs/promises'

const originalDatabaseUrl = process.env.DATABASE_URL

test('verifyCredentials creates a demo admin session when the seeded user table is empty', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'urmis-auth-'))
  const tempDbPath = path.join(tempDir, 'auth-test.db')
  process.env.DATABASE_URL = `file:${tempDbPath.replace(/\\/g, '/')}`

  try {
    const { default: prisma } = await import('../server/prisma.js')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institutionId INTEGER,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        refresh_token TEXT,
        role TEXT NOT NULL DEFAULT 'admin',
        isSuspended BOOLEAN NOT NULL DEFAULT 0,
        isLocked BOOLEAN NOT NULL DEFAULT 0,
        mustChangePassword BOOLEAN NOT NULL DEFAULT 0,
        email_verified BOOLEAN NOT NULL DEFAULT 0,
        email_verification_token TEXT,
        email_verification_expires DATETIME,
        password_reset_token TEXT,
        password_reset_expires DATETIME,
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until DATETIME,
        last_login_at DATETIME,
        refresh_token_version INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        activation_status TEXT NOT NULL DEFAULT 'active',
        activation_token TEXT,
        activation_expires DATETIME,
        activation_identifier TEXT,
        activation_university_id TEXT,
        activation_account_type TEXT
      )
    `)

    const { default: authService } = await import('../server/shared/services/authService.js')
    const result = await authService.verifyCredentials('admin@greenfield.edu', 'Admin@123')

    assert.equal(result.reason, null)
    assert.equal(result.user?.email, 'admin@greenfield.edu')
    assert.equal(result.user?.role, 'super_admin')
  } finally {
    process.env.DATABASE_URL = originalDatabaseUrl
    await rm(tempDir, { recursive: true, force: true })
  }
})

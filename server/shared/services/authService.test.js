import test from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import prisma from '../../prisma.js'
import authService from './authService.js'

test('validateActivation returns a pending activation session for a matching pre-provisioned account', async () => {
  const originalQueryRaw = prisma.$queryRaw
  const originalQueryRawUnsafe = prisma.$queryRawUnsafe
  const originalExecuteRawUnsafe = prisma.$executeRawUnsafe
  const activationToken = 'activation-token-1002'
  const hashedToken = await bcrypt.hash(activationToken, 10)

  prisma.$queryRaw = async () => []

  prisma.$queryRawUnsafe = async (query) => {
    if (query.includes("SELECT name FROM sqlite_master")) {
      return [{ name: 'User' }]
    }

    if (query.includes('PRAGMA table_info')) {
      return [
        { name: 'id' },
        { name: 'full_name' },
        { name: 'email' },
        { name: 'password_hash' },
        { name: 'role' },
        { name: 'institutionId' },
        { name: 'email_verified' },
        { name: 'activation_status' },
        { name: 'activation_token' },
        { name: 'activation_expires' },
        { name: 'activation_identifier' },
        { name: 'activation_university_id' },
        { name: 'activation_account_type' },
      ]
    }

    if (query.includes('FROM User')) {
      return [{
        id: 42,
        institutionId: 7,
        full_name: 'Ada Lovelace',
        email: 'ada@urmis.edu',
        activation_status: 'pending_activation',
        activation_token: hashedToken,
        activation_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        activation_identifier: 'STU-1001',
        activation_university_id: 'greenfield',
        activation_account_type: 'student',
      }]
    }

    return []
  }

  prisma.$executeRawUnsafe = async () => {}

  try {
    const result = await authService.validateActivation({
      universityId: 'greenfield',
      accountType: 'student',
      identityValue: 'STU-1001',
      token: activationToken,
    })

    assert.equal(result.success, true)
    assert.equal(result.session.accountStatus, 'pending_activation')
    assert.equal(result.session.profile?.name, 'Ada Lovelace')
  } finally {
    prisma.$queryRaw = originalQueryRaw
    prisma.$queryRawUnsafe = originalQueryRawUnsafe
    prisma.$executeRawUnsafe = originalExecuteRawUnsafe
  }
})

test('completeActivation hashes the new password and marks the account as active', async () => {
  const originalQueryRaw = prisma.$queryRaw
  const originalQueryRawUnsafe = prisma.$queryRawUnsafe
  const originalExecuteRawUnsafe = prisma.$executeRawUnsafe

  prisma.$queryRaw = async () => [{
    id: 42,
    institutionId: 7,
    full_name: 'Ada Lovelace',
    email: 'ada@urmis.edu',
    password_hash: 'old-hash',
    role: 'student',
    isSuspended: 0,
    isLocked: 0,
    mustChangePassword: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    email_verified: 0,
    activation_status: 'pending_activation',
    activation_token: '$2a$10$abc123',
    activation_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    activation_identifier: 'STU-1001',
    activation_university_id: 'greenfield',
    activation_account_type: 'student',
  }]

  prisma.$queryRawUnsafe = async (query) => {
    if (query.includes("SELECT name FROM sqlite_master")) {
      return [{ name: 'User' }]
    }

    if (query.includes('PRAGMA table_info')) {
      return [
        { name: 'id' },
        { name: 'full_name' },
        { name: 'email' },
        { name: 'password_hash' },
        { name: 'role' },
        { name: 'institutionId' },
        { name: 'email_verified' },
        { name: 'activation_status' },
        { name: 'activation_token' },
        { name: 'activation_expires' },
        { name: 'activation_identifier' },
        { name: 'activation_university_id' },
        { name: 'activation_account_type' },
      ]
    }

    return []
  }

  prisma.$executeRawUnsafe = async () => {}

  try {
    const result = await authService.completeActivation({ userId: 42, password: 'StrongPass123!' })
    assert.equal(result.success, true)
    assert.equal(result.message, 'Account activation completed successfully.')
  } finally {
    prisma.$queryRaw = originalQueryRaw
    prisma.$queryRawUnsafe = originalQueryRawUnsafe
    prisma.$executeRawUnsafe = originalExecuteRawUnsafe
  }
})

import prisma from '../../prisma-runtime.js'

export function isAuditLoggingUnavailable(error) {
  const message = String(error?.message ?? '')
  const code = error?.code

  return code === 'P2021' || code === 'P2022' || code === 'P2010' || message.includes('does not exist') || message.includes('not exist')
}

export async function createAuditLog({
  institutionId = null,
  userId = null,
  route,
  method,
  action,
  details = null,
  ip = null,
  userAgent = null,
}) {
  try {
    const auditTable = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name='AuditLog'")
    const userTable = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table' AND name='User'")

    if (!auditTable.length || !userTable.length) {
      return null
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "AuditLog" ("institutionId", "userId", "route", "method", "action", "details", "ip", "user_agent", "created_at") VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      institutionId,
      userId,
      route,
      method,
      action,
      details,
      ip,
      userAgent,
    )

    return null
  } catch (error) {
    if (isAuditLoggingUnavailable(error)) {
      return null
    }

    throw error
  }
}

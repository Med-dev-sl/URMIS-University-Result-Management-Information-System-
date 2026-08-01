import prisma from '../../prisma.js'

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
  return prisma.auditLog.create({
    data: {
      institutionId,
      userId,
      route,
      method,
      action,
      details,
      ip,
      user_agent: userAgent,
    },
  })
}

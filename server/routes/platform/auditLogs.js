import { Router } from 'express'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'
import prisma from '../../prisma.js'

const router = Router()

const normalizeAuditLog = (log) => ({
  id: log.id,
  institution_id: log.institutionId,
  user_id: log.userId,
  user_name: log.user?.full_name ?? null,
  route: log.route,
  method: log.method,
  action: log.action,
  details: log.details,
  ip: log.ip,
  user_agent: log.user_agent,
  created_at: log.created_at,
})

router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const where = {}
    if (req.query.institution_id) {
      where.institutionId = Number(req.query.institution_id)
    }
    if (req.query.user_id) {
      where.userId = Number(req.query.user_id)
    }
    if (req.query.action) {
      where.action = String(req.query.action)
    }
    if (req.query.route) {
      where.route = { contains: String(req.query.route) }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { full_name: true } } },
      take: Number(req.query.limit ?? 100),
    })

    res.json(logs.map(normalizeAuditLog))
  } catch (error) {
    console.error('Failed to load audit logs:', error)
    res.status(500).json({ message: 'Unable to load audit logs.' })
  }
})

export default router

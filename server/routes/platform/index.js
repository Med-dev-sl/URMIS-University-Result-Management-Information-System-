import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import auditLogsRoutes from './auditLogs.js'
import platformSettingsRoutes from '../settings/platform.js'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'platform' })
})

router.get('/overview', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const [institutionCount, userCount, studentCount, resultCount] = await Promise.all([
      prisma.institution.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.result.count(),
    ])

    const settings = await prisma.platformSetting.findMany({ select: { key: true, value: true } })
    const revenueValue = settings
      .filter((item) => ['revenue', 'monthly_revenue', 'subscription_revenue'].includes(String(item.key).toLowerCase()))
      .map((item) => Number(item.value))
      .filter((value) => Number.isFinite(value))
      .reduce((sum, value) => sum + value, 0)

    const activeSessions = await prisma.user.count({ where: { refresh_token: { not: null } } })

    res.json({
      totalUniversities: institutionCount,
      totalUsers: userCount,
      activeUniversities: institutionCount,
      activeSessions,
      revenue: revenueValue || 0,
      systemStatus: 'healthy',
      studentCount,
      resultCount,
    })
  } catch (error) {
    console.error('Failed to load platform overview:', error)
    res.status(500).json({ message: 'Unable to load platform overview.' })
  }
})

router.get('/monitoring', requireAuth, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const [institutionCount, userCount, studentCount, resultCount, settings] = await Promise.all([
      prisma.institution.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.result.count(),
      prisma.platformSetting.findMany({ select: { key: true, value: true } }),
    ])

    const storagePath = path.resolve(process.cwd(), 'data', 'urmis-prisma.db')
    const storageStats = fs.existsSync(storagePath) ? fs.statSync(storagePath) : null

    const health = {
      status: 'healthy',
      uptime: Number(process.uptime().toFixed(0)),
      dbPath: storagePath,
      databaseSizeBytes: storageStats?.size ?? 0,
      institutions: institutionCount,
      users: userCount,
      students: studentCount,
      results: resultCount,
      integrations: settings.length,
    }

    res.json(health)
  } catch (error) {
    console.error('Failed to load platform monitoring data:', error)
    res.status(500).json({ message: 'Unable to load platform monitoring data.' })
  }
})

router.use('/audit-logs', auditLogsRoutes)
router.use('/settings', platformSettingsRoutes)

export default router

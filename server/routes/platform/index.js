import { Router } from 'express'
import auditLogsRoutes from './auditLogs.js'
import platformSettingsRoutes from '../settings/platform.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'platform' })
})

router.use('/audit-logs', auditLogsRoutes)
router.use('/settings', platformSettingsRoutes)

export default router

import { Router } from 'express'
import auditLogsRoutes from './auditLogs.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'platform' })
})

router.use('/audit-logs', auditLogsRoutes)

export default router

import { Router } from 'express'
import notificationsRoutes from './notifications.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'communication' })
})

router.use('/notifications', notificationsRoutes)

export default router

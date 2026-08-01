import { Router } from 'express'
import institutionSettingsRoutes from './institution.js'
import platformSettingsRoutes from './platform.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'settings' })
})

router.use('/institution', institutionSettingsRoutes)
router.use('/platform', platformSettingsRoutes)

export default router

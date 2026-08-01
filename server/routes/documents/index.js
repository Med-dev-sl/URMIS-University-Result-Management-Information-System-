import { Router } from 'express'
import uploadsRoutes from './uploads.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'documents' })
})

router.use('/uploads', uploadsRoutes)

export default router

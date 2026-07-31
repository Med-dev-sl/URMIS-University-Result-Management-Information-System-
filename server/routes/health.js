import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'urmis-api',
    timestamp: new Date().toISOString(),
  })
})

export default router

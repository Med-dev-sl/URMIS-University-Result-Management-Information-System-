import { Router } from 'express'
import transcriptRequestsRoutes from './transcriptRequests.js'
import transcriptsRoutes from './transcripts.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({ status: 'ok', module: 'examination' })
})

router.use('/transcript-requests', transcriptRequestsRoutes)
router.use('/transcripts', transcriptsRoutes)

export default router

import { Router } from 'express'
import { getAll } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const faculties = await getAll(
      `SELECT f.id, f.name, i.name AS institution_name
       FROM faculties f
       LEFT JOIN institutions i ON i.id = f.institution_id
       ORDER BY f.id DESC`
    )

    res.json(faculties)
  } catch (error) {
    console.error('Failed to fetch faculties:', error)
    res.status(500).json({ message: 'Unable to load faculties.' })
  }
})

export default router

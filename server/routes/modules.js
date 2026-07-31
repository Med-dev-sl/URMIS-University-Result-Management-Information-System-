import { Router } from 'express'
import { getAll } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const modules = await getAll(
      `SELECT m.id, m.module_code, m.module_name, m.credit_hours, m.description, c.course_name, d.name AS department_name
       FROM modules m
       LEFT JOIN courses c ON c.id = m.course_id
       LEFT JOIN departments d ON d.id = c.department_id
       ORDER BY m.id DESC`
    )

    res.json(modules)
  } catch (error) {
    console.error('Failed to fetch modules:', error)
    res.status(500).json({ message: 'Unable to load modules.' })
  }
})

export default router

import { Router } from 'express'
import { getAll } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const courses = await getAll(`
      SELECT id, course_code, course_name, credit_hours, department_id
      FROM courses
      ORDER BY id DESC
    `)

    res.json(courses)
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    res.status(500).json({ message: 'Unable to load courses.' })
  }
})

export default router

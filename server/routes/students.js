import { Router } from 'express'
import { getAll, getOne, runSql } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const students = await getAll(`
      SELECT s.id, s.student_id, s.full_name, s.semester, s.enrollment_year, d.name AS department_name
      FROM students s
      LEFT JOIN departments d ON d.id = s.department_id
      ORDER BY s.id DESC
    `)

    res.json(students)
  } catch {
    res.status(500).json({ message: 'Unable to load students.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { student_id, full_name, department_id, semester, enrollment_year } = req.body

    if (!student_id || !full_name) {
      return res.status(400).json({ message: 'student_id and full_name are required.' })
    }

    const institution = await getOne('SELECT id FROM institutions ORDER BY id ASC LIMIT 1')

    const result = await runSql(
      'INSERT INTO students (institution_id, student_id, full_name, department_id, semester, enrollment_year) VALUES (?, ?, ?, ?, ?, ?)',
      [institution?.id || 1, student_id, full_name, department_id || null, semester || '100 Level', enrollment_year || '2025'],
    )

    const savedStudent = await getOne(
      `SELECT s.id, s.student_id, s.full_name, s.semester, s.enrollment_year, d.name AS department_name
       FROM students s
       LEFT JOIN departments d ON d.id = s.department_id
       WHERE s.id = ?`,
      [result.id],
    )

    return res.status(201).json(savedStudent)
  } catch (error) {
    console.error('Create student failed:', error)
    return res.status(500).json({ message: 'Unable to create student.' })
  }
})

export default router

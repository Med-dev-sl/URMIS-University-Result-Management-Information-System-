import { Router } from 'express'
import { getAll, getOne, runSql } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { department_id } = req.query
    const params = []
    let query = `
      SELECT id, course_code, course_name, credit_hours, department_id
      FROM courses
    `

    if (department_id) {
      query += ' WHERE department_id = ?'
      params.push(department_id)
    }

    query += ' ORDER BY id DESC'

    const courses = await getAll(query, params)
    res.json(courses)
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    res.status(500).json({ message: 'Unable to load courses.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { course_code, course_name, credit_hours, department_id } = req.body

    if (!course_code || !course_name || !department_id) {
      return res.status(400).json({ message: 'Course code, name, and department_id are required.' })
    }

    const department = await getOne('SELECT id FROM departments WHERE id = ?', [department_id])
    if (!department) {
      return res.status(404).json({ message: 'Department not found.' })
    }

    const institution = await getOne('SELECT id FROM institutions ORDER BY id ASC LIMIT 1')
    const result = await runSql(
      'INSERT INTO courses (institution_id, department_id, course_code, course_name, credit_hours) VALUES (?, ?, ?, ?, ?)',
      [institution?.id || 1, department_id, course_code, course_name, credit_hours || 3],
    )

    const createdCourse = await getOne('SELECT id, course_code, course_name, credit_hours, department_id FROM courses WHERE id = ?', [result.id])
    res.status(201).json(createdCourse)
  } catch (error) {
    console.error('Failed to create course:', error)
    res.status(500).json({ message: 'Unable to create course.' })
  }
})

export default router

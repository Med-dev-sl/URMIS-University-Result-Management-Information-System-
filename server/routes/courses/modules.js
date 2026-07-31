import { Router } from 'express'
import { getAll, getOne, runSql } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { course_id } = req.query
    const params = []
    let query = `
      SELECT m.id, m.module_code, m.module_name, m.credit_hours, m.description, c.course_name, d.name AS department_name
      FROM modules m
      LEFT JOIN courses c ON c.id = m.course_id
      LEFT JOIN departments d ON d.id = c.department_id
    `

    if (course_id) {
      query += ' WHERE m.course_id = ?'
      params.push(course_id)
    }

    query += ' ORDER BY m.id DESC'

    const modules = await getAll(query, params)
    res.json(modules)
  } catch (error) {
    console.error('Failed to fetch modules:', error)
    res.status(500).json({ message: 'Unable to load modules.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { module_code, module_name, credit_hours, description, course_id } = req.body

    if (!module_code || !module_name || !course_id) {
      return res.status(400).json({ message: 'Module code, name, and course_id are required.' })
    }

    const course = await getOne('SELECT id FROM courses WHERE id = ?', [course_id])
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    const institution = await getOne('SELECT id FROM institutions ORDER BY id ASC LIMIT 1')
    const result = await runSql(
      'INSERT INTO modules (institution_id, course_id, module_code, module_name, credit_hours, description) VALUES (?, ?, ?, ?, ?, ?)',
      [institution?.id || 1, course_id, module_code, module_name, credit_hours || 1, description || ''],
    )

    const createdModule = await getOne('SELECT id, module_code, module_name, credit_hours, description, course_id FROM modules WHERE id = ?', [result.id])
    res.status(201).json(createdModule)
  } catch (error) {
    console.error('Failed to create module:', error)
    res.status(500).json({ message: 'Unable to create module.' })
  }
})

export default router

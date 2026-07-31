import { Router } from 'express'
import { getAll, getOne, runSql } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { faculty_id } = req.query
    const params = []
    let query = `
      SELECT d.id, d.name, d.faculty_id, f.name AS faculty_name
      FROM departments d
      LEFT JOIN faculties f ON f.id = d.faculty_id
    `

    if (faculty_id) {
      query += ' WHERE d.faculty_id = ?'
      params.push(faculty_id)
    }

    query += ' ORDER BY d.id DESC'

    const departments = await getAll(query, params)
    res.json(departments)
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    res.status(500).json({ message: 'Unable to load departments.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, faculty_id } = req.body

    if (!name || !faculty_id) {
      return res.status(400).json({ message: 'Department name and faculty_id are required.' })
    }

    const faculty = await getOne('SELECT id FROM faculties WHERE id = ?', [faculty_id])
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' })
    }

    const institution = await getOne('SELECT id FROM institutions ORDER BY id ASC LIMIT 1')
    const result = await runSql(
      'INSERT INTO departments (institution_id, faculty_id, name) VALUES (?, ?, ?)',
      [institution?.id || 1, faculty_id, name],
    )

    const createdDepartment = await getOne('SELECT id, name, faculty_id FROM departments WHERE id = ?', [result.id])
    res.status(201).json(createdDepartment)
  } catch (error) {
    console.error('Failed to create department:', error)
    res.status(500).json({ message: 'Unable to create department.' })
  }
})

export default router

import { Router } from 'express'
import { getAll, getOne, runSql } from '../db.js'

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

router.post('/', async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Faculty name is required.' })
    }

    const institution = await getOne('SELECT id FROM institutions ORDER BY id ASC LIMIT 1')
    const result = await runSql(
      'INSERT INTO faculties (institution_id, name) VALUES (?, ?)',
      [institution?.id || 1, name],
    )

    const createdFaculty = await getOne('SELECT id, name FROM faculties WHERE id = ?', [result.id])
    res.status(201).json(createdFaculty)
  } catch (error) {
    console.error('Failed to create faculty:', error)
    res.status(500).json({ message: 'Unable to create faculty.' })
  }
})

export default router

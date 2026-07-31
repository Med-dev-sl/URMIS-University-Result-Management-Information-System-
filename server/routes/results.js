import { Router } from 'express'
import { getAll, getOne, runSql } from '../db.js'

const router = Router()

const gradeForPercentage = (percentage) => {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

router.get('/', async (req, res) => {
  try {
    const results = await getAll(`
      SELECT r.id, r.assignment_score, r.exam_score, r.total_score, r.percentage, r.grade, r.pass_fail, r.academic_session,
             s.full_name AS student_name, c.course_name
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN courses c ON c.id = r.course_id
      ORDER BY r.id DESC
    `)

    res.json(results)
  } catch (error) {
    console.error('Failed to fetch results:', error)
    res.status(500).json({ message: 'Unable to load results.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { student_id, course_id, assignment_score, exam_score, academic_session } = req.body

    if (!student_id || !course_id || assignment_score == null || exam_score == null || !academic_session) {
      return res.status(400).json({ message: 'student_id, course_id, assignment_score, exam_score, and academic_session are required.' })
    }

    const student = await getOne('SELECT id, institution_id FROM students WHERE id = ?', [student_id])
    const course = await getOne('SELECT id, institution_id FROM courses WHERE id = ?', [course_id])

    if (!student || !course) {
      return res.status(404).json({ message: 'Student or course not found.' })
    }

    const totalScore = Number(assignment_score) + Number(exam_score)
    const percentage = Math.round(totalScore / 2)
    const grade = gradeForPercentage(percentage)
    const pass_fail = percentage >= 60 ? 'PASS' : 'FAIL'

    const result = await runSql(
      `INSERT INTO results (institution_id, student_id, course_id, assignment_score, exam_score, total_score, percentage, grade, pass_fail, academic_session)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student.institution_id, student.id, course.id, assignment_score, exam_score, totalScore, percentage, grade, pass_fail, academic_session],
    )

    const createdResult = await getOne(
      `SELECT r.id, r.assignment_score, r.exam_score, r.total_score, r.percentage, r.grade, r.pass_fail, r.academic_session,
              s.full_name AS student_name, c.course_name
       FROM results r
       JOIN students s ON s.id = r.student_id
       JOIN courses c ON c.id = r.course_id
       WHERE r.id = ?`,
      [result.id],
    )

    res.status(201).json(createdResult)
  } catch (error) {
    console.error('Failed to create result:', error)
    res.status(500).json({ message: 'Unable to create result.' })
  }
})

export default router

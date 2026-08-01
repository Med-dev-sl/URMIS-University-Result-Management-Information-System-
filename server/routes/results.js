import { Router } from 'express'
import prisma from '../prisma.js'

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
    const results = await prisma.result.findMany({
      orderBy: { id: 'desc' },
      include: {
        student: { select: { full_name: true } },
        course: { select: { course_name: true } },
      },
    })

    res.json(results.map((r) => ({
      id: r.id,
      assignment_score: r.assignment_score,
      exam_score: r.exam_score,
      total_score: r.total_score,
      percentage: r.percentage,
      grade: r.grade,
      pass_fail: r.pass_fail,
      academic_session: r.academic_session,
      student_name: r.student.full_name,
      course_name: r.course.course_name,
    })))
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

    const student = await prisma.student.findUnique({
      where: { id: Number(student_id) },
      select: { id: true, institutionId: true },
    })

    const course = await prisma.course.findUnique({
      where: { id: Number(course_id) },
      select: { id: true, institutionId: true },
    })

    if (!student || !course) {
      return res.status(404).json({ message: 'Student or course not found.' })
    }

    const totalScore = Number(assignment_score) + Number(exam_score)
    const percentage = Math.round(totalScore / 2)
    const grade = gradeForPercentage(percentage)
    const pass_fail = percentage >= 60 ? 'PASS' : 'FAIL'

    const result = await prisma.result.create({
      data: {
        institutionId: student.institutionId,
        studentId: student.id,
        courseId: course.id,
        assignment_score: Number(assignment_score),
        exam_score: Number(exam_score),
        total_score: totalScore,
        percentage,
        grade,
        pass_fail,
        academic_session,
      },
      include: {
        student: { select: { full_name: true } },
        course: { select: { course_name: true } },
      },
    })

    res.status(201).json({
      id: result.id,
      assignment_score: result.assignment_score,
      exam_score: result.exam_score,
      total_score: result.total_score,
      percentage: result.percentage,
      grade: result.grade,
      pass_fail: result.pass_fail,
      academic_session: result.academic_session,
      student_name: result.student.full_name,
      course_name: result.course.course_name,
    })
  } catch (error) {
    console.error('Failed to create result:', error)
    res.status(500).json({ message: 'Unable to create result.' })
  }
})

export default router

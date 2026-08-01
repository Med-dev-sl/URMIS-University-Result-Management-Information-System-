import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth, requireRole } from '../shared/middlewares/auth.js'

const router = Router()

const gradeForPercentage = (percentage) => {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

const normalizeResult = (result) => ({
  id: result.id,
  student_id: result.studentId,
  course_id: result.courseId,
  assignment_score: result.assignment_score,
  exam_score: result.exam_score,
  total_score: result.total_score,
  percentage: result.percentage,
  grade: result.grade,
  pass_fail: result.pass_fail,
  academic_session: result.academic_session,
  student_name: result.student?.full_name ?? null,
  course_name: result.course?.course_name ?? null,
  institution_id: result.institutionId,
  created_at: result.created_at,
})

const calculateResult = ({ assignment_score, exam_score }) => {
  const assignment = Number(assignment_score)
  const exam = Number(exam_score)
  const total_score = assignment + exam
  const percentage = Math.round(total_score / 2)
  const grade = gradeForPercentage(percentage)
  const pass_fail = percentage >= 60 ? 'PASS' : 'FAIL'

  return { assignment, exam, total_score, percentage, grade, pass_fail }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.student_id) {
      where.studentId = Number(req.query.student_id)
    }
    if (req.query.course_id) {
      where.courseId = Number(req.query.course_id)
    }
    if (req.query.academic_session) {
      where.academic_session = String(req.query.academic_session)
    }
    if (req.query.pass_fail) {
      where.pass_fail = String(req.query.pass_fail).toUpperCase()
    }

    const results = await prisma.result.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        student: { select: { full_name: true } },
        course: { select: { course_name: true } },
      },
    })

    res.json(results.map(normalizeResult))
  } catch (error) {
    console.error('Failed to fetch results:', error)
    res.status(500).json({ message: 'Unable to load results.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const resultId = Number(req.params.id)
    if (Number.isNaN(resultId)) {
      return res.status(400).json({ message: 'Invalid result identifier.' })
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        student: { select: { full_name: true } },
        course: { select: { course_name: true } },
      },
    })

    if (!result) {
      return res.status(404).json({ message: 'Result not found.' })
    }

    if (req.user.role !== 'admin' && result.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    res.json(normalizeResult(result))
  } catch (error) {
    console.error('Failed to fetch result:', error)
    res.status(500).json({ message: 'Unable to load result.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
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

    if (req.user.role !== 'admin' && student.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: student belongs to another institution.' })
    }
    if (req.user.role !== 'admin' && course.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: course belongs to another institution.' })
    }

    const { assignment, exam, total_score, percentage, grade, pass_fail } = calculateResult({ assignment_score, exam_score })

    const result = await prisma.result.create({
      data: {
        institutionId: student.institutionId,
        studentId: student.id,
        courseId: course.id,
        assignment_score: assignment,
        exam_score: exam,
        total_score,
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

    res.status(201).json(normalizeResult(result))
  } catch (error) {
    console.error('Failed to create result:', error)
    res.status(500).json({ message: 'Unable to create result.' })
  }
})

router.put('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const resultId = Number(req.params.id)
    if (Number.isNaN(resultId)) {
      return res.status(400).json({ message: 'Invalid result identifier.' })
    }

    const existingResult = await prisma.result.findUnique({ where: { id: resultId } })
    if (!existingResult) {
      return res.status(404).json({ message: 'Result not found.' })
    }

    if (req.user.role !== 'admin' && existingResult.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot update result from another institution.' })
    }

    const { assignment_score, exam_score, academic_session, student_id, course_id } = req.body
    const updateData = {}

    if (academic_session) updateData.academic_session = academic_session

    if (student_id !== undefined) {
      const student = await prisma.student.findUnique({
        where: { id: Number(student_id) },
        select: { id: true, institutionId: true },
      })
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' })
      }
      if (req.user.role !== 'admin' && student.institutionId !== req.user.institutionId) {
        return res.status(403).json({ message: 'Forbidden: student belongs to another institution.' })
      }
      updateData.studentId = student.id
      updateData.institutionId = student.institutionId
    }

    if (course_id !== undefined) {
      const course = await prisma.course.findUnique({
        where: { id: Number(course_id) },
        select: { id: true, institutionId: true },
      })
      if (!course) {
        return res.status(404).json({ message: 'Course not found.' })
      }
      if (req.user.role !== 'admin' && course.institutionId !== req.user.institutionId) {
        return res.status(403).json({ message: 'Forbidden: course belongs to another institution.' })
      }
      updateData.courseId = course.id
      updateData.institutionId = course.institutionId
    }

    if (assignment_score !== undefined) updateData.assignment_score = Number(assignment_score)
    if (exam_score !== undefined) updateData.exam_score = Number(exam_score)

    if (assignment_score !== undefined || exam_score !== undefined) {
      const existingAssignment = assignment_score !== undefined ? Number(assignment_score) : existingResult.assignment_score
      const existingExam = exam_score !== undefined ? Number(exam_score) : existingResult.exam_score
      const { total_score, percentage, grade, pass_fail } = calculateResult({ assignment_score: existingAssignment, exam_score: existingExam })
      updateData.total_score = total_score
      updateData.percentage = percentage
      updateData.grade = grade
      updateData.pass_fail = pass_fail
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const result = await prisma.result.update({
      where: { id: resultId },
      data: updateData,
      include: {
        student: { select: { full_name: true } },
        course: { select: { course_name: true } },
      },
    })

    res.json(normalizeResult(result))
  } catch (error) {
    console.error('Failed to update result:', error)
    res.status(500).json({ message: 'Unable to update result.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const resultId = Number(req.params.id)
    if (Number.isNaN(resultId)) {
      return res.status(400).json({ message: 'Invalid result identifier.' })
    }

    const result = await prisma.result.findUnique({ where: { id: resultId } })
    if (!result) {
      return res.status(404).json({ message: 'Result not found.' })
    }

    if (req.user.role !== 'admin' && result.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot delete result from another institution.' })
    }

    await prisma.result.delete({ where: { id: resultId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete result:', error)
    res.status(500).json({ message: 'Unable to delete result.' })
  }
})

export default router

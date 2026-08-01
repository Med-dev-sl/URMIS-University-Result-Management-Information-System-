import { Router } from 'express'
import prisma from '../../prisma-runtime.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'
import { calculateFinalMarks, deriveGrade } from '../../shared/services/assessmentService.js'

const router = Router()

const defaultWeights = [
  { component: 'ca', weight: 30 },
  { component: 'assignment', weight: 20 },
  { component: 'practical', weight: 10 },
  { component: 'exam', weight: 40 },
]

const getInstitutionScope = (req) => {
  if (req.user.role === 'admin' && req.query.institution_id) {
    return Number(req.query.institution_id)
  }
  return req.user.institutionId
}

const normalizeWeights = (weightsInput = []) => {
  const allowed = ['ca', 'assignment', 'practical', 'exam']
  if (!Array.isArray(weightsInput) || weightsInput.length === 0) {
    return defaultWeights
  }

  return weightsInput
    .map((entry) => ({
      component: String(entry?.component || '').toLowerCase(),
      weight: Number(entry?.weight ?? 0),
    }))
    .filter((entry) => allowed.includes(entry.component) && Number.isFinite(entry.weight) && entry.weight > 0)
}

const ensureAssessmentWeights = async (assessmentId, weightsInput = []) => {
  const normalized = normalizeWeights(weightsInput)

  const existing = await prisma.assessmentWeight.findMany({ where: { assessmentId } })
  const existingMap = new Map(existing.map((item) => [item.component, item]))

  await Promise.all(normalized.map(async (item) => {
    if (existingMap.has(item.component)) {
      await prisma.assessmentWeight.update({
        where: { assessmentId_component: { assessmentId, component: item.component } },
        data: { weight: item.weight },
      })
      return
    }

    await prisma.assessmentWeight.create({
      data: {
        assessmentId,
        component: item.component,
        weight: item.weight,
      },
    })
  }))

  const incomingComponents = new Set(normalized.map((item) => item.component))
  const stale = existing.filter((item) => !incomingComponents.has(item.component))
  if (stale.length > 0) {
    await Promise.all(stale.map((item) => prisma.assessmentWeight.delete({ where: { id: item.id } })))
  }

  return prisma.assessmentWeight.findMany({ where: { assessmentId } })
}

const syncPublishedScores = async (assessmentId, weights) => {
  const scores = await prisma.assessmentScore.findMany({ where: { assessmentId } })

  await Promise.all(scores.map(async (score) => {
    const marks = {
      ca: score.caScore ?? 0,
      assignment: score.assignmentScore ?? 0,
      practical: score.practicalScore ?? 0,
      exam: score.examScore ?? 0,
    }

    const finalMark = calculateFinalMarks(marks, weights)
    const grade = deriveGrade(finalMark)

    await prisma.assessmentScore.update({
      where: { id: score.id },
      data: {
        finalMark,
        grade,
        status: 'submitted',
      },
    })
  }))
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const institutionId = getInstitutionScope(req)
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const assessments = await prisma.assessment.findMany({
      where: { institutionId },
      include: {
        weights: true,
        scores: { include: { student: { select: { id: true, full_name: true, student_id: true } } } },
      },
      orderBy: { created_at: 'desc' },
    })

    return res.json(assessments)
  } catch (error) {
    console.error('Failed to load assessments:', error)
    return res.status(500).json({ message: 'Unable to load assessments.' })
  }
})

router.post('/', requireAuth, requireRole('lecturer', 'admin'), async (req, res) => {
  try {
    const institutionId = req.user.institutionId
    const {
      title,
      courseId,
      academicSession,
      semester,
      description,
      weights,
      studentIds = [],
      scores = [],
    } = req.body

    if (!title || !courseId || !academicSession) {
      return res.status(400).json({ message: 'title, courseId, and academicSession are required.' })
    }

    const course = await prisma.course.findFirst({ where: { id: Number(courseId), institutionId } })
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    const assessment = await prisma.assessment.create({
      data: {
        institutionId,
        courseId: course.id,
        title: String(title),
        academicSession: String(academicSession),
        semester: semester ? String(semester) : null,
        description: description ? String(description) : null,
        status: 'draft',
      },
    })

    await ensureAssessmentWeights(assessment.id, weights)

    const studentList = Array.isArray(studentIds) ? studentIds : []
    const scoreEntries = Array.isArray(scores) ? scores : []

    await Promise.all([
      ...studentList.map((studentId) => prisma.assessmentScore.create({
        data: {
          assessmentId: assessment.id,
          studentId: Number(studentId),
        },
      })),
      ...scoreEntries.map((entry) => prisma.assessmentScore.create({
        data: {
          assessmentId: assessment.id,
          studentId: Number(entry.studentId),
          caScore: entry.caScore != null ? Number(entry.caScore) : null,
          assignmentScore: entry.assignmentScore != null ? Number(entry.assignmentScore) : null,
          practicalScore: entry.practicalScore != null ? Number(entry.practicalScore) : null,
          examScore: entry.examScore != null ? Number(entry.examScore) : null,
          status: 'draft',
        },
      })),
    ])

    const created = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: { weights: true, scores: true },
    })

    return res.status(201).json(created)
  } catch (error) {
    console.error('Failed to create assessment:', error)
    return res.status(500).json({ message: 'Unable to create assessment.' })
  }
})

router.put('/:id', requireAuth, requireRole('lecturer', 'admin'), async (req, res) => {
  try {
    const assessmentId = Number(req.params.id)
    const institutionId = req.user.institutionId
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, institutionId } })

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    if (assessment.status === 'published') {
      return res.status(400).json({ message: 'Published assessments cannot be edited.' })
    }

    const { title, academicSession, semester, description, weights, scores } = req.body
    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        title: title ? String(title) : assessment.title,
        academicSession: academicSession ? String(academicSession) : assessment.academicSession,
        semester: semester != null ? String(semester) : assessment.semester,
        description: description != null ? String(description) : assessment.description,
        status: req.body.status ? String(req.body.status) : assessment.status,
      },
    })

    if (weights) {
      await ensureAssessmentWeights(assessmentId, weights)
    }

    if (Array.isArray(scores)) {
      await Promise.all(scores.map(async (entry) => {
        const studentId = Number(entry.studentId)
        if (!studentId) return

        await prisma.assessmentScore.upsert({
          where: { assessmentId_studentId: { assessmentId, studentId } },
          update: {
            caScore: entry.caScore != null ? Number(entry.caScore) : undefined,
            assignmentScore: entry.assignmentScore != null ? Number(entry.assignmentScore) : undefined,
            practicalScore: entry.practicalScore != null ? Number(entry.practicalScore) : undefined,
            examScore: entry.examScore != null ? Number(entry.examScore) : undefined,
            status: entry.status ? String(entry.status) : 'draft',
          },
          create: {
            assessmentId,
            studentId,
            caScore: entry.caScore != null ? Number(entry.caScore) : null,
            assignmentScore: entry.assignmentScore != null ? Number(entry.assignmentScore) : null,
            practicalScore: entry.practicalScore != null ? Number(entry.practicalScore) : null,
            examScore: entry.examScore != null ? Number(entry.examScore) : null,
            status: entry.status ? String(entry.status) : 'draft',
          },
        })
      }))
    }

    const result = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { weights: true, scores: true },
    })

    return res.json(result)
  } catch (error) {
    console.error('Failed to update assessment:', error)
    return res.status(500).json({ message: 'Unable to update assessment.' })
  }
})

router.delete('/:id', requireAuth, requireRole('lecturer', 'admin'), async (req, res) => {
  try {
    const assessmentId = Number(req.params.id)
    const institutionId = req.user.institutionId
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, institutionId } })

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    if (assessment.status === 'published') {
      return res.status(400).json({ message: 'Published assessments cannot be deleted.' })
    }

    await prisma.assessmentScore.deleteMany({ where: { assessmentId } })
    await prisma.assessmentWeight.deleteMany({ where: { assessmentId } })
    await prisma.assessment.delete({ where: { id: assessmentId } })

    return res.status(204).send()
  } catch (error) {
    console.error('Failed to delete assessment:', error)
    return res.status(500).json({ message: 'Unable to delete assessment.' })
  }
})

router.post('/:id/publish', requireAuth, requireRole('lecturer', 'admin'), async (req, res) => {
  try {
    const assessmentId = Number(req.params.id)
    const institutionId = req.user.institutionId
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, institutionId } })

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    let weights = await prisma.assessmentWeight.findMany({ where: { assessmentId } })
    if (weights.length === 0) {
      weights = await ensureAssessmentWeights(assessmentId, defaultWeights)
    }

    await syncPublishedScores(assessmentId, weights)

    const published = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'published',
        reviewStatus: 'approved',
        publishedAt: new Date(),
      },
    })

    return res.json(published)
  } catch (error) {
    console.error('Failed to publish assessment:', error)
    return res.status(500).json({ message: 'Unable to publish assessment.' })
  }
})

router.post('/:id/approve', requireAuth, requireRole('hod', 'admin'), async (req, res) => {
  try {
    const assessmentId = Number(req.params.id)
    const institutionId = req.user.institutionId
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, institutionId } })

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        reviewStatus: 'approved',
        status: assessment.status === 'published' ? 'published' : 'submitted',
      },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Failed to approve assessment:', error)
    return res.status(500).json({ message: 'Unable to approve assessment.' })
  }
})

router.post('/:id/request-correction', requireAuth, requireRole('hod', 'admin'), async (req, res) => {
  try {
    const assessmentId = Number(req.params.id)
    const institutionId = req.user.institutionId
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, institutionId } })

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' })
    }

    const updated = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        reviewStatus: 'correction_requested',
        status: 'draft',
      },
    })

    return res.json(updated)
  } catch (error) {
    console.error('Failed to request assessment correction:', error)
    return res.status(500).json({ message: 'Unable to request assessment correction.' })
  }
})

export default router

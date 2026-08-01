import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const normalizeTranscript = (transcript) => ({
  id: transcript.id,
  institution_id: transcript.institutionId,
  student_id: transcript.studentId,
  generated_by: transcript.generated_by,
  academic_session: transcript.academic_session,
  content: transcript.content,
  created_at: transcript.created_at,
  updated_at: transcript.updated_at,
  student_name: transcript.student?.full_name ?? null,
  generated_by_name: transcript.generator?.full_name ?? null,
})

const enforceInstitutionAccess = (institutionId, req, res) => {
  if (req.user.role !== 'admin' && institutionId !== req.user.institutionId) {
    res.status(403).json({ message: 'Forbidden: access denied.' })
    return false
  }
  return true
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
    if (req.query.academic_session) {
      where.academic_session = String(req.query.academic_session)
    }

    const transcripts = await prisma.transcript.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { student: { select: { full_name: true } }, generator: { select: { full_name: true } } },
    })

    res.json(transcripts.map(normalizeTranscript))
  } catch (error) {
    console.error('Failed to load transcripts:', error)
    res.status(500).json({ message: 'Unable to load transcripts.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const transcriptId = Number(req.params.id)
    if (Number.isNaN(transcriptId)) {
      return res.status(400).json({ message: 'Invalid transcript identifier.' })
    }

    const transcript = await prisma.transcript.findUnique({
      where: { id: transcriptId },
      include: { student: { select: { full_name: true } }, generator: { select: { full_name: true } } },
    })
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found.' })
    }

    if (!enforceInstitutionAccess(transcript.institutionId, req, res)) {
      return
    }

    res.json(normalizeTranscript(transcript))
  } catch (error) {
    console.error('Failed to fetch transcript:', error)
    res.status(500).json({ message: 'Unable to load transcript.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'exam_officer', 'staff', 'university_administrator'), async (req, res) => {
  try {
    const { student_id, academic_session, content } = req.body
    if (!student_id || !academic_session || !content) {
      return res.status(400).json({ message: 'student_id, academic_session and content are required.' })
    }

    const studentId = Number(student_id)
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ message: 'Invalid student identifier.' })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, institutionId: true },
    })
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    if (req.user.role !== 'admin' && student.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: student belongs to another institution.' })
    }

    const transcript = await prisma.transcript.create({
      data: {
        institutionId: student.institutionId,
        studentId: student.id,
        generated_by: req.user.id,
        academic_session: String(academic_session),
        content: String(content),
      },
      include: { student: { select: { full_name: true } }, generator: { select: { full_name: true } } },
    })

    res.status(201).json(normalizeTranscript(transcript))
  } catch (error) {
    console.error('Failed to create transcript:', error)
    res.status(400).json({ message: error.message || 'Unable to create transcript.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const transcriptId = Number(req.params.id)
    if (Number.isNaN(transcriptId)) {
      return res.status(400).json({ message: 'Invalid transcript identifier.' })
    }

    const transcript = await prisma.transcript.findUnique({ where: { id: transcriptId } })
    if (!transcript) {
      return res.status(404).json({ message: 'Transcript not found.' })
    }

    if (!enforceInstitutionAccess(transcript.institutionId, req, res)) {
      return
    }

    await prisma.transcript.delete({ where: { id: transcriptId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete transcript:', error)
    res.status(500).json({ message: 'Unable to delete transcript.' })
  }
})

export default router

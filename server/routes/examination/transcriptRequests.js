import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const normalizeTranscriptRequest = (request) => ({
  id: request.id,
  institution_id: request.institutionId,
  student_id: request.studentId,
  requested_by: request.requested_by,
  purpose: request.purpose,
  status: request.status,
  delivery_address: request.delivery_address,
  created_at: request.created_at,
  updated_at: request.updated_at,
  student_name: request.student?.full_name ?? null,
  requested_by_name: request.requester?.full_name ?? null,
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
    if (req.query.status) {
      where.status = String(req.query.status).toLowerCase()
    }

    const requests = await prisma.transcriptRequest.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { student: { select: { full_name: true } }, requester: { select: { full_name: true } } },
    })

    res.json(requests.map(normalizeTranscriptRequest))
  } catch (error) {
    console.error('Failed to load transcript requests:', error)
    res.status(500).json({ message: 'Unable to load transcript requests.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff', 'lecturer', 'hod', 'dean', 'exam_officer', 'university_administrator', 'student'), async (req, res) => {
  try {
    const { student_id, purpose, delivery_address } = req.body
    if (!student_id || !purpose) {
      return res.status(400).json({ message: 'student_id and purpose are required.' })
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

    const request = await prisma.transcriptRequest.create({
      data: {
        institutionId: student.institutionId,
        studentId: student.id,
        requested_by: req.user.id,
        purpose: String(purpose),
        delivery_address: delivery_address || null,
        status: 'pending',
      },
      include: { student: { select: { full_name: true } }, requester: { select: { full_name: true } } },
    })

    res.status(201).json(normalizeTranscriptRequest(request))
  } catch (error) {
    console.error('Failed to create transcript request:', error)
    res.status(400).json({ message: error.message || 'Unable to create transcript request.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const requestId = Number(req.params.id)
    if (Number.isNaN(requestId)) {
      return res.status(400).json({ message: 'Invalid transcript request identifier.' })
    }

    const request = await prisma.transcriptRequest.findUnique({
      where: { id: requestId },
      include: { student: { select: { full_name: true } }, requester: { select: { full_name: true } } },
    })
    if (!request) {
      return res.status(404).json({ message: 'Transcript request not found.' })
    }

    if (!enforceInstitutionAccess(request.institutionId, req, res)) {
      return
    }

    res.json(normalizeTranscriptRequest(request))
  } catch (error) {
    console.error('Failed to fetch transcript request:', error)
    res.status(500).json({ message: 'Unable to load transcript request.' })
  }
})

router.put('/:id', requireAuth, requireRole('admin', 'exam_officer', 'staff', 'university_administrator'), async (req, res) => {
  try {
    const requestId = Number(req.params.id)
    if (Number.isNaN(requestId)) {
      return res.status(400).json({ message: 'Invalid transcript request identifier.' })
    }

    const existing = await prisma.transcriptRequest.findUnique({ where: { id: requestId } })
    if (!existing) {
      return res.status(404).json({ message: 'Transcript request not found.' })
    }

    if (!enforceInstitutionAccess(existing.institutionId, req, res)) {
      return
    }

    const { status, delivery_address, purpose } = req.body
    const updateData = {}
    if (status) {
      const normalizedStatus = String(status).toLowerCase()
      if (!['pending', 'approved', 'rejected', 'fulfilled'].includes(normalizedStatus)) {
        return res.status(400).json({ message: 'Invalid transcript request status.' })
      }
      updateData.status = normalizedStatus
    }
    if (delivery_address !== undefined) updateData.delivery_address = delivery_address || null
    if (purpose !== undefined) updateData.purpose = String(purpose)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const updated = await prisma.transcriptRequest.update({
      where: { id: requestId },
      data: updateData,
      include: { student: { select: { full_name: true } }, requester: { select: { full_name: true } } },
    })

    res.json(normalizeTranscriptRequest(updated))
  } catch (error) {
    console.error('Failed to update transcript request:', error)
    res.status(400).json({ message: error.message || 'Unable to update transcript request.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const requestId = Number(req.params.id)
    if (Number.isNaN(requestId)) {
      return res.status(400).json({ message: 'Invalid transcript request identifier.' })
    }

    const existing = await prisma.transcriptRequest.findUnique({ where: { id: requestId } })
    if (!existing) {
      return res.status(404).json({ message: 'Transcript request not found.' })
    }

    if (!enforceInstitutionAccess(existing.institutionId, req, res)) {
      return
    }

    await prisma.transcriptRequest.delete({ where: { id: requestId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete transcript request:', error)
    res.status(500).json({ message: 'Unable to delete transcript request.' })
  }
})

export default router

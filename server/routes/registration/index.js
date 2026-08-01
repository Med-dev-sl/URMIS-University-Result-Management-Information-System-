import { Router } from 'express'
import prisma from '../../prisma-runtime.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const isAdmin = (role) => role === 'admin'
const isHod = (role) => role === 'hod'
const isExamOfficer = (role) => role === 'exam_officer'
const isLecturer = (role) => role === 'lecturer'
const isStudent = (role) => role === 'student'

const canApproveRegistration = (role) => isHod(role) || isExamOfficer(role) || isAdmin(role)
const canViewRegistration = (role) => isAdmin(role) || isHod(role) || isExamOfficer(role) || isLecturer(role)

const getInstitutionScope = (req) => {
  if (req.user.role === 'admin' && req.query.institution_id) {
    return Number(req.query.institution_id)
  }
  return req.user.institutionId
}

const getEligiblePeriod = async (institutionId) => {
  return prisma.registrationPeriod.findFirst({
    where: {
      institutionId,
      status: 'open',
    },
    orderBy: { created_at: 'desc' },
  })
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const role = req.user.role
    const institutionId = getInstitutionScope(req)

    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    if (isStudent(role)) {
      const registrations = await prisma.registration.findMany({
        where: { institutionId, studentId: req.user.id },
        include: { courses: { include: { course: true } }, registrationPeriod: true },
        orderBy: { created_at: 'desc' },
      })
      return res.json(registrations)
    }

    if (!canViewRegistration(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role.' })
    }

    const registrations = await prisma.registration.findMany({
      where: { institutionId },
      include: { student: true, courses: { include: { course: true } }, registrationPeriod: true },
      orderBy: { created_at: 'desc' },
    })
    return res.json(registrations)
  } catch (error) {
    console.error('Failed to load registrations:', error)
    res.status(500).json({ message: 'Unable to load registrations.' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const role = req.user.role
    if (!isStudent(role)) {
      return res.status(403).json({ message: 'Only students can create registrations.' })
    }

    const institutionId = req.user.institutionId
    const { courseIds, registrationPeriodId } = req.body
    const period = registrationPeriodId
      ? await prisma.registrationPeriod.findFirst({ where: { id: Number(registrationPeriodId), institutionId } })
      : await getEligiblePeriod(institutionId)

    if (!period || period.status !== 'open') {
      return res.status(400).json({ message: 'Registration is not currently open.' })
    }

    const student = await prisma.student.findFirst({ where: { institutionId, id: req.user.id } })
    if (!student) {
      return res.status(404).json({ message: 'Student record not found.' })
    }

    const existing = await prisma.registration.findFirst({
      where: { studentId: student.id, registrationPeriodId: period.id },
    })

    if (existing) {
      return res.status(409).json({ message: 'A registration already exists for this student and period.' })
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: 'At least one course is required.' })
    }

    const courses = await prisma.course.findMany({
      where: { institutionId, id: { in: courseIds.map((id) => Number(id)) } },
    })

    if (courses.length !== courseIds.length) {
      return res.status(400).json({ message: 'One or more selected courses are invalid.' })
    }

    const totalCreditUnits = courses.reduce((sum, course) => sum + Number(course.credit_hours || 0), 0)
    if (totalCreditUnits > period.maxCreditUnits) {
      return res.status(400).json({ message: 'Selected courses exceed the maximum allowed credit units.' })
    }

    const registration = await prisma.registration.create({
      data: {
        institutionId,
        studentId: student.id,
        registrationPeriodId: period.id,
        status: 'submitted',
        totalCreditUnits,
        submittedAt: new Date(),
        courses: {
          create: courses.map((course) => ({
            courseId: course.id,
            creditUnits: Number(course.credit_hours || 0),
          })),
        },
      },
    })

    res.status(201).json(registration)
  } catch (error) {
    console.error('Failed to create registration:', error)
    res.status(500).json({ message: 'Unable to create registration.' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const registrationId = Number(req.params.id)
    const role = req.user.role
    if (!isStudent(role)) {
      return res.status(403).json({ message: 'Only students can update their registrations.' })
    }

    const registration = await prisma.registration.findUnique({ where: { id: registrationId } })
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' })
    }

    if (registration.studentId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own registration.' })
    }

    if (registration.status !== 'submitted') {
      return res.status(400).json({ message: 'Only submitted registrations can be modified.' })
    }

    const { courseIds } = req.body
    const courses = await prisma.course.findMany({
      where: { institutionId: registration.institutionId, id: { in: courseIds.map((id) => Number(id)) } },
    })

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: 'At least one course is required.' })
    }

    if (courses.length !== courseIds.length) {
      return res.status(400).json({ message: 'One or more selected courses are invalid.' })
    }

    const period = await prisma.registrationPeriod.findUnique({ where: { id: registration.registrationPeriodId } })
    const totalCreditUnits = courses.reduce((sum, course) => sum + Number(course.credit_hours || 0), 0)
    if (totalCreditUnits > period.maxCreditUnits) {
      return res.status(400).json({ message: 'Selected courses exceed the maximum allowed credit units.' })
    }

    await prisma.registrationCourse.deleteMany({ where: { registrationId } })
    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        totalCreditUnits,
        courses: {
          create: courses.map((course) => ({
            courseId: course.id,
            creditUnits: Number(course.credit_hours || 0),
          })),
        },
      },
      include: { courses: { include: { course: true } } },
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to update registration:', error)
    res.status(500).json({ message: 'Unable to update registration.' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const registrationId = Number(req.params.id)
    const role = req.user.role
    if (!isStudent(role)) {
      return res.status(403).json({ message: 'Only students can delete registrations.' })
    }

    const registration = await prisma.registration.findUnique({ where: { id: registrationId } })
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' })
    }

    if (registration.studentId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own registration.' })
    }

    await prisma.registrationCourse.deleteMany({ where: { registrationId } })
    await prisma.registration.delete({ where: { id: registrationId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete registration:', error)
    res.status(500).json({ message: 'Unable to delete registration.' })
  }
})

router.post('/:id/approve', requireAuth, async (req, res) => {
  try {
    const role = req.user.role
    if (!canApproveRegistration(role)) {
      return res.status(403).json({ message: 'Forbidden: only HOD, Examination Officer, or Admin can approve registrations.' })
    }

    const registrationId = Number(req.params.id)
    const registration = await prisma.registration.findUnique({ where: { id: registrationId } })
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' })
    }

    if (registration.status !== 'submitted') {
      return res.status(400).json({ message: 'Only submitted registrations can be approved.' })
    }

    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to approve registration:', error)
    res.status(500).json({ message: 'Unable to approve registration.' })
  }
})

router.post('/:id/reject', requireAuth, async (req, res) => {
  try {
    const role = req.user.role
    if (!canApproveRegistration(role)) {
      return res.status(403).json({ message: 'Forbidden: only HOD, Examination Officer, or Admin can reject registrations.' })
    }

    const registrationId = Number(req.params.id)
    const { reason } = req.body
    const registration = await prisma.registration.findUnique({ where: { id: registrationId } })
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found.' })
    }

    if (registration.status !== 'submitted') {
      return res.status(400).json({ message: 'Only submitted registrations can be rejected.' })
    }

    const updated = await prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason ? String(reason) : 'Rejected by reviewer.',
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to reject registration:', error)
    res.status(500).json({ message: 'Unable to reject registration.' })
  }
})

router.post('/periods', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { name, academicSession, status, maxCreditUnits } = req.body
    const institutionId = req.user.institutionId
    if (!name || !academicSession) {
      return res.status(400).json({ message: 'name and academicSession are required.' })
    }

    const period = await prisma.registrationPeriod.create({
      data: {
        institutionId,
        name: String(name),
        academicSession: String(academicSession),
        status: status ? String(status) : 'draft',
        maxCreditUnits: maxCreditUnits ? Number(maxCreditUnits) : 24,
      },
    })

    res.status(201).json(period)
  } catch (error) {
    console.error('Failed to create registration period:', error)
    res.status(500).json({ message: 'Unable to create registration period.' })
  }
})

router.put('/periods/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const periodId = Number(req.params.id)
    const { name, academicSession, status, maxCreditUnits } = req.body
    const period = await prisma.registrationPeriod.findUnique({ where: { id: periodId } })
    if (!period) {
      return res.status(404).json({ message: 'Registration period not found.' })
    }

    const updated = await prisma.registrationPeriod.update({
      where: { id: periodId },
      data: {
        name: name ? String(name) : period.name,
        academicSession: academicSession ? String(academicSession) : period.academicSession,
        status: status ? String(status) : period.status,
        maxCreditUnits: maxCreditUnits ? Number(maxCreditUnits) : period.maxCreditUnits,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to update registration period:', error)
    res.status(500).json({ message: 'Unable to update registration period.' })
  }
})

router.get('/periods', requireAuth, async (req, res) => {
  try {
    const role = req.user.role
    const institutionId = req.user.institutionId
    if (!institutionId) {
      return res.status(400).json({ message: 'Institution context is required.' })
    }
    if (!canViewRegistration(role) && !isAdmin(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role.' })
    }

    const periods = await prisma.registrationPeriod.findMany({
      where: { institutionId },
      orderBy: { created_at: 'desc' },
    })
    res.json(periods)
  } catch (error) {
    console.error('Failed to load registration periods:', error)
    res.status(500).json({ message: 'Unable to load registration periods.' })
  }
})

export default router

import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth, requireRole } from '../shared/middlewares/auth.js'

const router = Router()

const resolveInstitutionId = async (req) => {
  if (req.user.role === 'admin') {
    if (req.user.institutionId) {
      return req.user.institutionId
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' }, select: { id: true } })
    if (!institution) {
      throw new Error('No institution is configured for admin operations.')
    }

    return institution.id
  }

  if (!req.user.institutionId) {
    throw new Error('Tenant context is required for this operation.')
  }

  return req.user.institutionId
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.department_id) {
      where.departmentId = Number(req.query.department_id)
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        department: {
          select: { name: true },
        },
      },
    })

    const mapped = students.map((s) => ({
      id: s.id,
      student_id: s.student_id,
      full_name: s.full_name,
      semester: s.semester,
      enrollment_year: s.enrollment_year,
      department_name: s.department?.name ?? null,
    }))

    res.json(mapped)
  } catch (error) {
    console.error('Load students failed:', error)
    res.status(500).json({ message: 'Unable to load students.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { student_id, full_name, department_id, semester, enrollment_year } = req.body

    if (!student_id || !full_name) {
      return res.status(400).json({ message: 'student_id and full_name are required.' })
    }

    const institutionId = await resolveInstitutionId(req)

    let department = null
    if (department_id) {
      department = await prisma.department.findUnique({
        where: { id: Number(department_id) },
        select: { id: true, institutionId: true },
      })

      if (!department) {
        return res.status(404).json({ message: 'Department not found.' })
      }

      if (req.user.role !== 'admin' && department.institutionId !== req.user.institutionId) {
        return res.status(403).json({ message: 'Forbidden: department belongs to another institution.' })
      }
    }

    const student = await prisma.student.create({
      data: {
        institutionId,
        student_id,
        full_name,
        departmentId: department?.id ?? null,
        semester: semester ?? '100 Level',
        enrollment_year: enrollment_year ?? '2025',
      },
      include: {
        department: {
          select: { name: true },
        },
      },
    })

    res.status(201).json({
      id: student.id,
      student_id: student.student_id,
      full_name: student.full_name,
      semester: student.semester,
      enrollment_year: student.enrollment_year,
      department_name: student.department?.name ?? null,
    })
  } catch (error) {
    console.error('Create student failed:', error)
    return res.status(500).json({ message: 'Unable to create student.' })
  }
})

export default router

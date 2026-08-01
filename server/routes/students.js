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

const normalizeStudent = (student) => ({
  id: student.id,
  student_id: student.student_id,
  full_name: student.full_name,
  semester: student.semester,
  enrollment_year: student.enrollment_year,
  department_id: student.departmentId,
  department_name: student.department?.name ?? null,
  institution_id: student.institutionId,
  created_at: student.created_at,
})

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}
    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.department_id) {
      where.departmentId = Number(req.query.department_id)
    }
    if (req.query.student_id) {
      where.student_id = String(req.query.student_id)
    }
    if (req.query.full_name) {
      where.full_name = { contains: String(req.query.full_name), mode: 'insensitive' }
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

    res.json(students.map(normalizeStudent))
  } catch (error) {
    console.error('Load students failed:', error)
    res.status(500).json({ message: 'Unable to load students.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const studentId = Number(req.params.id)
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ message: 'Invalid student identifier.' })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { department: { select: { name: true } } },
    })
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    if (req.user.role !== 'admin' && student.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    res.json(normalizeStudent(student))
  } catch (error) {
    console.error('Load student failed:', error)
    res.status(500).json({ message: 'Unable to load student.' })
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
        department: { select: { name: true } },
      },
    })

    res.status(201).json(normalizeStudent(student))
  } catch (error) {
    console.error('Create student failed:', error)
    return res.status(500).json({ message: 'Unable to create student.' })
  }
})

router.put('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const studentId = Number(req.params.id)
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ message: 'Invalid student identifier.' })
    }

    const existingStudent = await prisma.student.findUnique({ where: { id: studentId } })
    if (!existingStudent) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    if (req.user.role !== 'admin' && existingStudent.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot update student from another institution.' })
    }

    const { student_id, full_name, department_id, semester, enrollment_year } = req.body
    const updateData = {}

    if (student_id) updateData.student_id = student_id
    if (full_name) updateData.full_name = full_name
    if (semester) updateData.semester = semester
    if (enrollment_year) updateData.enrollment_year = enrollment_year

    if (department_id !== undefined) {
      if (department_id === null || department_id === '') {
        updateData.departmentId = null
      } else {
        const department = await prisma.department.findUnique({
          where: { id: Number(department_id) },
          select: { id: true, institutionId: true },
        })
        if (!department) {
          return res.status(404).json({ message: 'Department not found.' })
        }
        if (req.user.role !== 'admin' && department.institutionId !== req.user.institutionId) {
          return res.status(403).json({ message: 'Forbidden: department belongs to another institution.' })
        }
        updateData.departmentId = department.id
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: {
        department: { select: { name: true } },
      },
    })

    res.json(normalizeStudent(student))
  } catch (error) {
    console.error('Update student failed:', error)
    res.status(500).json({ message: 'Unable to update student.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const studentId = Number(req.params.id)
    if (Number.isNaN(studentId)) {
      return res.status(400).json({ message: 'Invalid student identifier.' })
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      return res.status(404).json({ message: 'Student not found.' })
    }

    await prisma.student.delete({ where: { id: studentId } })

    res.status(204).send()
  } catch (error) {
    console.error('Delete student failed:', error)
    res.status(500).json({ message: 'Unable to delete student.' })
  }
})

export default router

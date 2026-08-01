import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const where = {}

    if (req.user.role !== 'admin') {
      where.institutionId = req.user.institutionId
    }
    if (req.query.department_id) {
      where.departmentId = Number(req.query.department_id)
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { id: 'desc' },
    })

    res.json(courses)
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    res.status(500).json({ message: 'Unable to load courses.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { course_code, course_name, credit_hours, department_id } = req.body

    if (!course_code || !course_name || !department_id) {
      return res.status(400).json({ message: 'Course code, name, and department_id are required.' })
    }

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

    const createdCourse = await prisma.course.create({
      data: {
        institutionId: department.institutionId,
        departmentId: department.id,
        course_code,
        course_name,
        credit_hours: Number(credit_hours) || 3,
      },
    })

    res.status(201).json(createdCourse)
  } catch (error) {
    console.error('Failed to create course:', error)
    res.status(500).json({ message: 'Unable to create course.' })
  }
})

export default router

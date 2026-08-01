import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const normalizeCourse = (course) => ({
  id: course.id,
  course_code: course.course_code,
  course_name: course.course_name,
  credit_hours: course.credit_hours,
  department_id: course.departmentId,
  department_name: course.department?.name ?? null,
  institution_id: course.institutionId,
  created_at: course.created_at,
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
    if (req.query.course_code) {
      where.course_code = { contains: String(req.query.course_code), mode: 'insensitive' }
    }
    if (req.query.course_name) {
      where.course_name = { contains: String(req.query.course_name), mode: 'insensitive' }
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { department: { select: { name: true } } },
    })

    res.json(courses.map(normalizeCourse))
  } catch (error) {
    console.error('Failed to fetch courses:', error)
    res.status(500).json({ message: 'Unable to load courses.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const courseId = Number(req.params.id)
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course identifier.' })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { department: { select: { name: true } } },
    })

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    if (req.user.role !== 'admin' && course.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: access denied.' })
    }

    res.json(normalizeCourse(course))
  } catch (error) {
    console.error('Failed to fetch course:', error)
    res.status(500).json({ message: 'Unable to load course.' })
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
      include: { department: { select: { name: true } } },
    })

    res.status(201).json(normalizeCourse(createdCourse))
  } catch (error) {
    console.error('Failed to create course:', error)
    res.status(500).json({ message: 'Unable to create course.' })
  }
})

router.put('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const courseId = Number(req.params.id)
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course identifier.' })
    }

    const existingCourse = await prisma.course.findUnique({ where: { id: courseId } })
    if (!existingCourse) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    if (req.user.role !== 'admin' && existingCourse.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot update course from another institution.' })
    }

    const { course_code, course_name, credit_hours, department_id } = req.body
    const updateData = {}

    if (course_code) updateData.course_code = course_code
    if (course_name) updateData.course_name = course_name
    if (credit_hours !== undefined) updateData.credit_hours = Number(credit_hours)

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
        updateData.institutionId = department.institutionId
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update.' })
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: { department: { select: { name: true } } },
    })

    res.json(normalizeCourse(updatedCourse))
  } catch (error) {
    console.error('Failed to update course:', error)
    res.status(500).json({ message: 'Unable to update course.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const courseId = Number(req.params.id)
    if (Number.isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course identifier.' })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' })
    }

    if (req.user.role !== 'admin' && course.institutionId !== req.user.institutionId) {
      return res.status(403).json({ message: 'Forbidden: cannot delete course from another institution.' })
    }

    await prisma.course.delete({ where: { id: courseId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete course:', error)
    res.status(500).json({ message: 'Unable to delete course.' })
  }
})

export default router

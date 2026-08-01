import { Router } from 'express'
import prisma from '../prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const where = {}

    if (req.query.faculty_id) {
      where.facultyId = Number(req.query.faculty_id)
    }

    const departments = await prisma.department.findMany({
      where,
      orderBy: { id: 'desc' },
      include: { faculty: { select: { name: true } } },
    })

    res.json(
      departments.map((department) => ({
        id: department.id,
        name: department.name,
        faculty_id: department.facultyId,
        faculty_name: department.faculty?.name ?? null,
      })),
    )
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    res.status(500).json({ message: 'Unable to load departments.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name, faculty_id } = req.body

    if (!name || !faculty_id) {
      return res.status(400).json({ message: 'Department name and faculty_id are required.' })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: Number(faculty_id) },
      select: { id: true, institutionId: true },
    })

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found.' })
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' } })

    const createdDepartment = await prisma.department.create({
      data: {
        institutionId: institution?.id ?? faculty.institutionId,
        facultyId: faculty.id,
        name,
      },
    })

    res.status(201).json({
      id: createdDepartment.id,
      name: createdDepartment.name,
      faculty_id: createdDepartment.facultyId,
    })
  } catch (error) {
    console.error('Failed to create department:', error)
    res.status(500).json({ message: 'Unable to create department.' })
  }
})

export default router

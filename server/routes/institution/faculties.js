import { Router } from 'express'
import prisma from '../prisma.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const faculties = await prisma.faculty.findMany({
      orderBy: { id: 'desc' },
      include: { institution: { select: { name: true } } },
    })

    res.json(
      faculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        institution_name: faculty.institution?.name ?? null,
      })),
    )
  } catch (error) {
    console.error('Failed to fetch faculties:', error)
    res.status(500).json({ message: 'Unable to load faculties.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Faculty name is required.' })
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' } })

    const createdFaculty = await prisma.faculty.create({
      data: {
        institutionId: institution?.id ?? 1,
        name,
      },
    })

    res.status(201).json(createdFaculty)
  } catch (error) {
    console.error('Failed to create faculty:', error)
    res.status(500).json({ message: 'Unable to create faculty.' })
  }
})

export default router

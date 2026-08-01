import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()
const institutionRoles = requireRole('admin', 'staff', 'university_administrator', 'hod', 'dean')

const institutionFilter = (req) => {
  if (req.user.role === 'admin' && req.query.institution_id) {
    return { institutionId: Number(req.query.institution_id) }
  }
  return { institutionId: req.user.institutionId }
}

router.get('/', requireAuth, institutionRoles, async (req, res) => {
  try {
    const settings = await prisma.institutionSetting.findMany({
      where: institutionFilter(req),
      orderBy: { key: 'asc' },
    })

    res.json(settings)
  } catch (error) {
    console.error('Failed to load institution settings:', error)
    res.status(500).json({ message: 'Unable to load institution settings.' })
  }
})

router.get('/:key', requireAuth, institutionRoles, async (req, res) => {
  try {
    const setting = await prisma.institutionSetting.findUnique({
      where: {
        institutionId_key: {
          institutionId: institutionFilter(req).institutionId,
          key: req.params.key,
        },
      },
    })

    if (!setting) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    res.json(setting)
  } catch (error) {
    console.error('Failed to fetch institution setting:', error)
    res.status(500).json({ message: 'Unable to load institution setting.' })
  }
})

router.post('/', requireAuth, institutionRoles, async (req, res) => {
  try {
    const { key, value, category, description } = req.body
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'key and value are required.' })
    }

    const institutionId = institutionFilter(req).institutionId
    const existing = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key } },
    })
    if (existing) {
      return res.status(409).json({ message: 'Setting key already exists.' })
    }

    const setting = await prisma.institutionSetting.create({
      data: {
        institutionId,
        key: String(key),
        value: String(value),
        category: String(category || 'general'),
        description: description ? String(description) : null,
      },
    })

    res.status(201).json(setting)
  } catch (error) {
    console.error('Failed to create institution setting:', error)
    res.status(500).json({ message: 'Unable to create institution setting.' })
  }
})

router.put('/:key', requireAuth, institutionRoles, async (req, res) => {
  try {
    const { value, category, description } = req.body
    const institutionId = institutionFilter(req).institutionId
    const existing = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: req.params.key } },
    })
    if (!existing) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    const updated = await prisma.institutionSetting.update({
      where: { id: existing.id },
      data: {
        value: value !== undefined ? String(value) : existing.value,
        category: category ? String(category) : existing.category,
        description: description !== undefined ? String(description) : existing.description,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to update institution setting:', error)
    res.status(500).json({ message: 'Unable to update institution setting.' })
  }
})

router.delete('/:key', requireAuth, institutionRoles, async (req, res) => {
  try {
    const institutionId = institutionFilter(req).institutionId
    const existing = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: req.params.key } },
    })
    if (!existing) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    await prisma.institutionSetting.delete({ where: { id: existing.id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete institution setting:', error)
    res.status(500).json({ message: 'Unable to delete institution setting.' })
  }
})

export default router

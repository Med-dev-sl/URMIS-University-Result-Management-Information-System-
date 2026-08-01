import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()
const platformRoles = requireRole('admin')

router.get('/', requireAuth, platformRoles, async (req, res) => {
  try {
    const settings = await prisma.platformSetting.findMany({ orderBy: { key: 'asc' } })
    res.json(settings)
  } catch (error) {
    console.error('Failed to load platform settings:', error)
    res.status(500).json({ message: 'Unable to load platform settings.' })
  }
})

router.get('/:key', requireAuth, platformRoles, async (req, res) => {
  try {
    const setting = await prisma.platformSetting.findUnique({ where: { key: req.params.key } })
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found.' })
    }
    res.json(setting)
  } catch (error) {
    console.error('Failed to fetch platform setting:', error)
    res.status(500).json({ message: 'Unable to load platform setting.' })
  }
})

router.post('/', requireAuth, platformRoles, async (req, res) => {
  try {
    const { key, value, category, description } = req.body
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'key and value are required.' })
    }

    const existing = await prisma.platformSetting.findUnique({ where: { key } })
    if (existing) {
      return res.status(409).json({ message: 'Setting key already exists.' })
    }

    const setting = await prisma.platformSetting.create({
      data: {
        key: String(key),
        value: String(value),
        category: String(category || 'general'),
        description: description ? String(description) : null,
      },
    })

    res.status(201).json(setting)
  } catch (error) {
    console.error('Failed to create platform setting:', error)
    res.status(500).json({ message: 'Unable to create platform setting.' })
  }
})

router.put('/:key', requireAuth, platformRoles, async (req, res) => {
  try {
    const { value, category, description } = req.body
    const existing = await prisma.platformSetting.findUnique({ where: { key: req.params.key } })
    if (!existing) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    const updated = await prisma.platformSetting.update({
      where: { id: existing.id },
      data: {
        value: value !== undefined ? String(value) : existing.value,
        category: category ? String(category) : existing.category,
        description: description !== undefined ? String(description) : existing.description,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to update platform setting:', error)
    res.status(500).json({ message: 'Unable to update platform setting.' })
  }
})

router.delete('/:key', requireAuth, platformRoles, async (req, res) => {
  try {
    const existing = await prisma.platformSetting.findUnique({ where: { key: req.params.key } })
    if (!existing) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    await prisma.platformSetting.delete({ where: { id: existing.id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete platform setting:', error)
    res.status(500).json({ message: 'Unable to delete platform setting.' })
  }
})

export default router

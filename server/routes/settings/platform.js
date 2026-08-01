import { Router } from 'express'
import prisma from '../../prisma-runtime.js'
import { requireAuth } from '../../shared/middlewares/auth.js'
import { createAuditLog } from '../../shared/security/auditService.js'
import { refreshPlatformSettingsCache } from '../../shared/services/platformSettingsService.js'

const router = Router()

const superAdminOnly = (req, res, next) => {
  const role = req.user?.role
  if (role !== 'admin' && role !== 'super_admin') {
    return res.status(403).json({ message: 'Forbidden: super admin access required.' })
  }
  return next()
}

const normalizeSettingPayload = (payload) => {
  const key = typeof payload.key === 'string' ? payload.key.trim() : ''
  const category = typeof payload.category === 'string' && payload.category.trim()
    ? payload.category.trim()
    : 'general'
  const description = typeof payload.description === 'string' && payload.description.trim()
    ? payload.description.trim()
    : null

  return { key, category, description }
}

router.get('/', requireAuth, superAdminOnly, async (req, res) => {
  try {
    const settings = await refreshPlatformSettingsCache()
    res.json(settings)
  } catch (error) {
    console.error('Failed to load platform settings:', error)
    res.status(500).json({ message: 'Unable to load platform settings.' })
  }
})

router.get('/:key', requireAuth, superAdminOnly, async (req, res) => {
  try {
    const settings = await refreshPlatformSettingsCache()
    const setting = settings.find((item) => item.key === req.params.key)
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found.' })
    }
    res.json(setting)
  } catch (error) {
    console.error('Failed to fetch platform setting:', error)
    res.status(500).json({ message: 'Unable to load platform setting.' })
  }
})

router.post('/', requireAuth, superAdminOnly, async (req, res) => {
  try {
    const { key, value, category, description } = req.body
    const trimmedKey = typeof key === 'string' ? key.trim() : ''
    if (!trimmedKey || value === undefined) {
      return res.status(400).json({ message: 'key and value are required.' })
    }

    const normalized = normalizeSettingPayload({ key: trimmedKey, category, description })
    const existing = await prisma.platformSetting.findUnique({ where: { key: trimmedKey } })
    if (existing) {
      return res.status(409).json({ message: 'Setting key already exists.' })
    }

    const setting = await prisma.platformSetting.create({
      data: {
        key: trimmedKey,
        value: String(value),
        category: normalized.category,
        description: normalized.description,
      },
    })

    await refreshPlatformSettingsCache()

    await createAuditLog({
      institutionId: req.user?.institutionId ?? null,
      userId: req.user?.id ?? null,
      route: req.originalUrl,
      method: req.method,
      action: 'PLATFORM_SETTING_CREATED',
      details: JSON.stringify({ id: setting.id, key: setting.key, category: setting.category }),
      ip: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
    })

    res.status(201).json(setting)
  } catch (error) {
    console.error('Failed to create platform setting:', error)
    res.status(500).json({ message: 'Unable to create platform setting.' })
  }
})

router.put('/:id', requireAuth, superAdminOnly, async (req, res) => {
  try {
    const { key, value, category, description } = req.body
    const settingId = Number(req.params.id)
    if (!Number.isInteger(settingId)) {
      return res.status(400).json({ message: 'Invalid setting identifier.' })
    }

    const existing = await prisma.platformSetting.findUnique({ where: { id: settingId } })
    if (!existing) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    if (key !== undefined && String(key).trim() !== existing.key) {
      return res.status(400).json({ message: 'Setting key cannot be changed.' })
    }

    const normalized = normalizeSettingPayload({ key: existing.key, category, description })
    const updated = await prisma.platformSetting.update({
      where: { id: settingId },
      data: {
        value: value !== undefined ? String(value) : existing.value,
        category: category !== undefined ? normalized.category : existing.category,
        description: description !== undefined ? normalized.description : existing.description,
      },
    })

    await refreshPlatformSettingsCache()

    await createAuditLog({
      institutionId: req.user?.institutionId ?? null,
      userId: req.user?.id ?? null,
      route: req.originalUrl,
      method: req.method,
      action: 'PLATFORM_SETTING_UPDATED',
      details: JSON.stringify({ id: updated.id, key: updated.key }),
      ip: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
    })

    res.json(updated)
  } catch (error) {
    console.error('Failed to update platform setting:', error)
    res.status(500).json({ message: 'Unable to update platform setting.' })
  }
})

router.delete('/:id', requireAuth, superAdminOnly, async (req, res) => {
  try {
    const settingId = Number(req.params.id)
    if (!Number.isInteger(settingId)) {
      return res.status(400).json({ message: 'Invalid setting identifier.' })
    }

    const existing = await prisma.platformSetting.findUnique({ where: { id: settingId } })
    if (!existing) {
      return res.status(404).json({ message: 'Setting not found.' })
    }

    await prisma.platformSetting.delete({ where: { id: settingId } })
    await refreshPlatformSettingsCache()

    await createAuditLog({
      institutionId: req.user?.institutionId ?? null,
      userId: req.user?.id ?? null,
      route: req.originalUrl,
      method: req.method,
      action: 'PLATFORM_SETTING_DELETED',
      details: JSON.stringify({ id: existing.id, key: existing.key }),
      ip: req.ip,
      userAgent: req.headers['user-agent'] ?? null,
    })

    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete platform setting:', error)
    res.status(500).json({ message: 'Unable to delete platform setting.' })
  }
})

export default router

import { Router } from 'express'
import prisma from '../../prisma.js'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'

const router = Router()

const roleAllowList = ['admin', 'super_admin', 'staff', 'university_administrator']

const resolveInstitutionId = async (req) => {
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    if (req.user.institutionId) {
      return req.user.institutionId
    }

    const institution = await prisma.institution.findFirst({ orderBy: { id: 'asc' }, select: { id: true } })
    if (!institution) {
      throw new Error('No institution is configured for university administration.')
    }

    return institution.id
  }

  if (!req.user.institutionId) {
    throw new Error('Tenant context is required for this operation.')
  }

  return req.user.institutionId
}

const normalizeProgramme = (item) => ({
  id: item.id,
  code: item.code,
  name: item.name,
  durationYears: item.durationYears,
  description: item.description || '',
  status: item.isActive ? 'active' : 'inactive',
  facultyId: item.facultyId ?? null,
  departmentId: item.departmentId ?? null,
  created_at: item.created_at,
})

const normalizeSession = (item) => ({
  id: item.id,
  name: item.name,
  startDate: item.startDate ? item.startDate.toISOString().slice(0, 10) : '',
  endDate: item.endDate ? item.endDate.toISOString().slice(0, 10) : '',
  status: item.isCurrent ? 'active' : 'inactive',
  created_at: item.created_at,
})

const normalizeSemester = (item) => ({
  id: item.id,
  name: item.name,
  code: item.code,
  status: item.isCurrent ? 'active' : 'inactive',
  academicSessionId: item.academicSessionId,
  created_at: item.created_at,
})

const normalizeLevel = (item) => ({
  id: item.id,
  name: item.name,
  code: item.code,
  status: item.isCurrent ? 'active' : 'inactive',
  sequence: item.sequence,
  created_at: item.created_at,
})

const normalizeGradeScale = (item) => ({
  id: item.id,
  gradeLetter: item.gradeLetter,
  minimumScore: item.minimumScore,
  maximumScore: item.maximumScore,
  gradePoint: item.gradePoint,
  description: item.description || '',
  status: item.isDefault ? 'active' : 'inactive',
  created_at: item.created_at,
})

const normalizeNotification = (item) => ({
  id: item.id,
  title: item.title,
  message: item.message,
  channel: item.channel,
  status: item.status,
  category: item.category,
  created_at: item.created_at,
})

const normalizeInstitutionSetting = (item) => ({
  id: item.id,
  key: item.key,
  value: item.value,
  category: item.category,
  description: item.description || '',
  status: 'active',
  created_at: item.created_at,
})

const normalizeAuditLog = (item) => ({
  id: item.id,
  action: item.action,
  actor: item.user?.full_name || 'System',
  status: 'logged',
  route: item.route,
  details: item.details,
  created_at: item.created_at,
})

router.get('/overview', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const [programmeCount, sessionCount, semesterCount, levelCount, notificationCount, auditCount] = await Promise.all([
      prisma.programme.count({ where: { institutionId } }),
      prisma.academicSession.count({ where: { institutionId } }),
      prisma.semester.count({ where: { institutionId } }),
      prisma.level.count({ where: { institutionId } }),
      prisma.notification.count({ where: { institutionId } }),
      prisma.auditLog.count({ where: { institutionId } }),
    ])

    res.json({
      programmeCount,
      sessionCount,
      semesterCount,
      levelCount,
      notificationCount,
      auditCount,
    })
  } catch (error) {
    console.error('University overview failed:', error)
    res.status(500).json({ message: 'Unable to load university overview.' })
  }
})

router.get('/programmes', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const programmes = await prisma.programme.findMany({
      where: { institutionId },
      orderBy: { id: 'desc' },
      include: { faculty: { select: { name: true } }, department: { select: { name: true } } },
    })

    res.json(programmes.map(normalizeProgramme))
  } catch (error) {
    console.error('Failed to load programmes:', error)
    res.status(500).json({ message: 'Unable to load programmes.' })
  }
})

router.post('/programmes', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const { code, name, durationYears, description, departmentId, facultyId, isActive } = req.body

    if (!code || !name) {
      return res.status(400).json({ message: 'Programme code and name are required.' })
    }

    const createdProgramme = await prisma.programme.create({
      data: {
        institutionId,
        code: String(code),
        name: String(name),
        durationYears: Number(durationYears) || 4,
        description: description ? String(description) : null,
        facultyId: facultyId ? Number(facultyId) : null,
        departmentId: departmentId ? Number(departmentId) : null,
        isActive: isActive !== false,
      },
      include: { faculty: { select: { name: true } }, department: { select: { name: true } } },
    })

    res.status(201).json(normalizeProgramme(createdProgramme))
  } catch (error) {
    console.error('Failed to create programme:', error)
    res.status(500).json({ message: 'Unable to create programme.' })
  }
})

router.put('/programmes/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const programmeId = Number(req.params.id)
    const existing = await prisma.programme.findFirst({ where: { id: programmeId, institutionId } })
    if (!existing) {
      return res.status(404).json({ message: 'Programme not found.' })
    }

    const updateData = {}
    if (req.body.code) updateData.code = String(req.body.code)
    if (req.body.name) updateData.name = String(req.body.name)
    if (req.body.durationYears !== undefined) updateData.durationYears = Number(req.body.durationYears)
    if (req.body.description !== undefined) updateData.description = req.body.description ? String(req.body.description) : null
    if (req.body.facultyId !== undefined) updateData.facultyId = req.body.facultyId ? Number(req.body.facultyId) : null
    if (req.body.departmentId !== undefined) updateData.departmentId = req.body.departmentId ? Number(req.body.departmentId) : null
    if (req.body.isActive !== undefined) updateData.isActive = Boolean(req.body.isActive)

    const updated = await prisma.programme.update({
      where: { id: programmeId },
      data: updateData,
      include: { faculty: { select: { name: true } }, department: { select: { name: true } } },
    })

    res.json(normalizeProgramme(updated))
  } catch (error) {
    console.error('Failed to update programme:', error)
    res.status(500).json({ message: 'Unable to update programme.' })
  }
})

router.delete('/programmes/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const programmeId = Number(req.params.id)
    const existing = await prisma.programme.findFirst({ where: { id: programmeId, institutionId } })
    if (!existing) {
      return res.status(404).json({ message: 'Programme not found.' })
    }

    await prisma.programme.delete({ where: { id: programmeId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete programme:', error)
    res.status(500).json({ message: 'Unable to delete programme.' })
  }
})

router.get('/academic-sessions', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const sessions = await prisma.academicSession.findMany({ where: { institutionId }, orderBy: { id: 'desc' } })
    res.json(sessions.map(normalizeSession))
  } catch (error) {
    console.error('Failed to load academic sessions:', error)
    res.status(500).json({ message: 'Unable to load academic sessions.' })
  }
})

router.post('/academic-sessions', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const { name, startDate, endDate, isCurrent } = req.body
    if (!name) return res.status(400).json({ message: 'Session name is required.' })

    const created = await prisma.academicSession.create({
      data: {
        institutionId,
        name: String(name),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: Boolean(isCurrent),
      },
    })

    res.status(201).json(normalizeSession(created))
  } catch (error) {
    console.error('Failed to create academic session:', error)
    res.status(500).json({ message: 'Unable to create academic session.' })
  }
})

router.put('/academic-sessions/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.academicSession.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Academic session not found.' })

    const updateData = {}
    if (req.body.name) updateData.name = String(req.body.name)
    if (req.body.startDate !== undefined) updateData.startDate = req.body.startDate ? new Date(req.body.startDate) : null
    if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate ? new Date(req.body.endDate) : null
    if (req.body.isCurrent !== undefined) updateData.isCurrent = Boolean(req.body.isCurrent)

    const updated = await prisma.academicSession.update({ where: { id }, data: updateData })
    res.json(normalizeSession(updated))
  } catch (error) {
    console.error('Failed to update academic session:', error)
    res.status(500).json({ message: 'Unable to update academic session.' })
  }
})

router.delete('/academic-sessions/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.academicSession.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Academic session not found.' })

    await prisma.academicSession.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete academic session:', error)
    res.status(500).json({ message: 'Unable to delete academic session.' })
  }
})

router.get('/semesters', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const semesters = await prisma.semester.findMany({ where: { institutionId }, orderBy: { id: 'desc' } })
    res.json(semesters.map(normalizeSemester))
  } catch (error) {
    console.error('Failed to load semesters:', error)
    res.status(500).json({ message: 'Unable to load semesters.' })
  }
})

router.post('/semesters', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const { name, code, academicSessionId, isCurrent } = req.body
    if (!name || !code || !academicSessionId) return res.status(400).json({ message: 'Semester name, code, and academic session are required.' })

    const created = await prisma.semester.create({
      data: {
        institutionId,
        academicSessionId: Number(academicSessionId),
        name: String(name),
        code: String(code),
        isCurrent: Boolean(isCurrent),
      },
    })

    res.status(201).json(normalizeSemester(created))
  } catch (error) {
    console.error('Failed to create semester:', error)
    res.status(500).json({ message: 'Unable to create semester.' })
  }
})

router.put('/semesters/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.semester.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Semester not found.' })
    const updateData = {}
    if (req.body.name) updateData.name = String(req.body.name)
    if (req.body.code) updateData.code = String(req.body.code)
    if (req.body.academicSessionId) updateData.academicSessionId = Number(req.body.academicSessionId)
    if (req.body.isCurrent !== undefined) updateData.isCurrent = Boolean(req.body.isCurrent)
    const updated = await prisma.semester.update({ where: { id }, data: updateData })
    res.json(normalizeSemester(updated))
  } catch (error) {
    console.error('Failed to update semester:', error)
    res.status(500).json({ message: 'Unable to update semester.' })
  }
})

router.delete('/semesters/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.semester.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Semester not found.' })
    await prisma.semester.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete semester:', error)
    res.status(500).json({ message: 'Unable to delete semester.' })
  }
})

router.get('/levels', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const levels = await prisma.level.findMany({ where: { institutionId }, orderBy: { id: 'desc' } })
    res.json(levels.map(normalizeLevel))
  } catch (error) {
    console.error('Failed to load levels:', error)
    res.status(500).json({ message: 'Unable to load levels.' })
  }
})

router.post('/levels', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const { name, code, sequence, isCurrent } = req.body
    if (!name || !code) return res.status(400).json({ message: 'Level name and code are required.' })

    const created = await prisma.level.create({
      data: {
        institutionId,
        name: String(name),
        code: String(code),
        sequence: Number(sequence) || 1,
        isCurrent: Boolean(isCurrent),
      },
    })

    res.status(201).json(normalizeLevel(created))
  } catch (error) {
    console.error('Failed to create level:', error)
    res.status(500).json({ message: 'Unable to create level.' })
  }
})

router.put('/levels/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.level.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Level not found.' })
    const updateData = {}
    if (req.body.name) updateData.name = String(req.body.name)
    if (req.body.code) updateData.code = String(req.body.code)
    if (req.body.sequence !== undefined) updateData.sequence = Number(req.body.sequence)
    if (req.body.isCurrent !== undefined) updateData.isCurrent = Boolean(req.body.isCurrent)
    const updated = await prisma.level.update({ where: { id }, data: updateData })
    res.json(normalizeLevel(updated))
  } catch (error) {
    console.error('Failed to update level:', error)
    res.status(500).json({ message: 'Unable to update level.' })
  }
})

router.delete('/levels/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.level.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Level not found.' })
    await prisma.level.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete level:', error)
    res.status(500).json({ message: 'Unable to delete level.' })
  }
})

router.get('/grade-scales', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const scales = await prisma.gradeScale.findMany({ where: { institutionId }, orderBy: { id: 'desc' } })
    res.json(scales.map(normalizeGradeScale))
  } catch (error) {
    console.error('Failed to load grade scales:', error)
    res.status(500).json({ message: 'Unable to load grade scales.' })
  }
})

router.post('/grade-scales', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const { gradeLetter, minimumScore, maximumScore, gradePoint, description, isDefault } = req.body
    if (!gradeLetter) return res.status(400).json({ message: 'Grade letter is required.' })

    const created = await prisma.gradeScale.create({
      data: {
        institutionId,
        gradeLetter: String(gradeLetter),
        minimumScore: Number(minimumScore) || 0,
        maximumScore: Number(maximumScore) || 100,
        gradePoint: Number(gradePoint) || 0,
        description: description ? String(description) : null,
        isDefault: Boolean(isDefault),
      },
    })

    res.status(201).json(normalizeGradeScale(created))
  } catch (error) {
    console.error('Failed to create grade scale:', error)
    res.status(500).json({ message: 'Unable to create grade scale.' })
  }
})

router.put('/grade-scales/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.gradeScale.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Grade scale not found.' })
    const updateData = {}
    if (req.body.gradeLetter) updateData.gradeLetter = String(req.body.gradeLetter)
    if (req.body.minimumScore !== undefined) updateData.minimumScore = Number(req.body.minimumScore)
    if (req.body.maximumScore !== undefined) updateData.maximumScore = Number(req.body.maximumScore)
    if (req.body.gradePoint !== undefined) updateData.gradePoint = Number(req.body.gradePoint)
    if (req.body.description !== undefined) updateData.description = req.body.description ? String(req.body.description) : null
    if (req.body.isDefault !== undefined) updateData.isDefault = Boolean(req.body.isDefault)
    const updated = await prisma.gradeScale.update({ where: { id }, data: updateData })
    res.json(normalizeGradeScale(updated))
  } catch (error) {
    console.error('Failed to update grade scale:', error)
    res.status(500).json({ message: 'Unable to update grade scale.' })
  }
})

router.delete('/grade-scales/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.gradeScale.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Grade scale not found.' })
    await prisma.gradeScale.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete grade scale:', error)
    res.status(500).json({ message: 'Unable to delete grade scale.' })
  }
})

router.get('/notifications', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const notifications = await prisma.notification.findMany({ where: { institutionId }, orderBy: { id: 'desc' } })
    res.json(notifications.map(normalizeNotification))
  } catch (error) {
    console.error('Failed to load notifications:', error)
    res.status(500).json({ message: 'Unable to load notifications.' })
  }
})

router.post('/notifications', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const sender = await prisma.user.findFirst({ where: { email: req.user.email } })
    const { title, message, channel, category, status } = req.body
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required.' })

    const created = await prisma.notification.create({
      data: {
        institutionId,
        senderId: sender?.id || req.user.id,
        title: String(title),
        message: String(message),
        channel: channel ? String(channel) : 'in-app',
        category: category ? String(category) : 'general',
        status: status ? String(status) : 'active',
      },
    })

    res.status(201).json(normalizeNotification(created))
  } catch (error) {
    console.error('Failed to create notification:', error)
    res.status(500).json({ message: 'Unable to create notification.' })
  }
})

router.put('/notifications/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const notificationId = Number(req.params.id)
    const existing = await prisma.notification.findFirst({ where: { id: notificationId, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Notification not found.' })

    const updateData = {}
    if (req.body.title) updateData.title = String(req.body.title)
    if (req.body.message !== undefined) updateData.message = String(req.body.message)
    if (req.body.channel) updateData.channel = String(req.body.channel)
    if (req.body.category) updateData.category = String(req.body.category)
    if (req.body.status) updateData.status = String(req.body.status)

    const updated = await prisma.notification.update({ where: { id: notificationId }, data: updateData })
    res.json(normalizeNotification(updated))
  } catch (error) {
    console.error('Failed to update notification:', error)
    res.status(500).json({ message: 'Unable to update notification.' })
  }
})

router.delete('/notifications/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const notificationId = Number(req.params.id)
    const existing = await prisma.notification.findFirst({ where: { id: notificationId, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Notification not found.' })

    await prisma.notification.delete({ where: { id: notificationId } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete notification:', error)
    res.status(500).json({ message: 'Unable to delete notification.' })
  }
})

router.get('/settings', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const settings = await prisma.institutionSetting.findMany({ where: { institutionId }, orderBy: { id: 'desc' } })
    res.json(settings.map(normalizeInstitutionSetting))
  } catch (error) {
    console.error('Failed to load institution settings:', error)
    res.status(500).json({ message: 'Unable to load institution settings.' })
  }
})

router.post('/settings', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const { key, value, category, description } = req.body
    if (!key || !value) return res.status(400).json({ message: 'Setting key and value are required.' })

    const created = await prisma.institutionSetting.create({
      data: {
        institutionId,
        key: String(key),
        value: String(value),
        category: category ? String(category) : 'general',
        description: description ? String(description) : null,
      },
    })

    res.status(201).json(normalizeInstitutionSetting(created))
  } catch (error) {
    console.error('Failed to create institution setting:', error)
    res.status(500).json({ message: 'Unable to create institution setting.' })
  }
})

router.put('/settings/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.institutionSetting.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Setting not found.' })
    const updateData = {}
    if (req.body.key) updateData.key = String(req.body.key)
    if (req.body.value !== undefined) updateData.value = String(req.body.value)
    if (req.body.category) updateData.category = String(req.body.category)
    if (req.body.description !== undefined) updateData.description = req.body.description ? String(req.body.description) : null
    const updated = await prisma.institutionSetting.update({ where: { id }, data: updateData })
    res.json(normalizeInstitutionSetting(updated))
  } catch (error) {
    console.error('Failed to update institution setting:', error)
    res.status(500).json({ message: 'Unable to update institution setting.' })
  }
})

router.delete('/settings/:id', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const id = Number(req.params.id)
    const existing = await prisma.institutionSetting.findFirst({ where: { id, institutionId } })
    if (!existing) return res.status(404).json({ message: 'Setting not found.' })
    await prisma.institutionSetting.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete institution setting:', error)
    res.status(500).json({ message: 'Unable to delete institution setting.' })
  }
})

router.get('/audit-logs', requireAuth, requireRole(...roleAllowList), async (req, res) => {
  try {
    const institutionId = await resolveInstitutionId(req)
    const logs = await prisma.auditLog.findMany({
      where: { institutionId },
      orderBy: { id: 'desc' },
      take: 50,
      include: { user: { select: { full_name: true } } },
    })
    res.json(logs.map(normalizeAuditLog))
  } catch (error) {
    console.error('Failed to load audit logs:', error)
    res.status(500).json({ message: 'Unable to load audit logs.' })
  }
})

export default router

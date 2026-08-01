import { Router } from 'express'
import { requireAuth, requireRole } from '../../shared/middlewares/auth.js'
import { createNotification, getNotificationsForUser, getNotificationById, markNotificationRead, deleteNotification } from '../../shared/services/notificationService.js'
import prisma from '../../prisma.js'

const router = Router()

const normalizeNotification = (notification) => ({
  id: notification.id,
  institution_id: notification.institutionId,
  sender_id: notification.senderId,
  sender_name: notification.sender?.full_name ?? null,
  recipient_id: notification.recipientId,
  recipient_name: notification.recipient?.full_name ?? null,
  title: notification.title,
  message: notification.message,
  category: notification.category,
  channel: notification.channel,
  is_global: notification.is_global,
  status: notification.status,
  read_at: notification.reads?.[0]?.read_at ?? null,
  is_read: Boolean(notification.reads?.length),
  created_at: notification.created_at,
  updated_at: notification.updated_at,
})

const enforceInstitutionAccess = (notification, req, res) => {
  if (!notification) {
    res.status(404).json({ message: 'Notification not found.' })
    return false
  }
  if (req.user.role !== 'admin' && notification.institutionId !== req.user.institutionId) {
    res.status(403).json({ message: 'Forbidden: access denied.' })
    return false
  }
  return true
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await getNotificationsForUser(req.user, {
      unread: req.query.unread === 'true',
      category: req.query.category,
    })

    res.json(notifications.map((notification) => normalizeNotification(notification, req.user.id)))
  } catch (error) {
    console.error('Failed to load notifications:', error)
    res.status(500).json({ message: 'Unable to load notifications.' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const notification = await getNotificationById(req.params.id)
    if (!enforceInstitutionAccess(notification, req, res)) {
      return
    }

    res.json(normalizeNotification(notification, req.user.id))
  } catch (error) {
    console.error('Failed to fetch notification:', error)
    res.status(500).json({ message: 'Unable to load notification.' })
  }
})

router.post('/', requireAuth, requireRole('admin', 'staff', 'university_administrator'), async (req, res) => {
  try {
    const { recipient_id, title, message, category, channel, is_global } = req.body
    if (!title || !message) {
      return res.status(400).json({ message: 'title and message are required.' })
    }

    if (!req.user.institutionId && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Institution context is required.' })
    }

    const institutionId = req.user.role === 'admin' ? Number(req.body.institution_id || req.user.institutionId) : req.user.institutionId
    if (!institutionId || Number.isNaN(institutionId)) {
      return res.status(400).json({ message: 'Valid institution_id is required.' })
    }

    if (recipient_id !== undefined && recipient_id !== null) {
      const recipient = await prisma.user.findUnique({ where: { id: Number(recipient_id) } })
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient user not found.' })
      }
      if (req.user.role !== 'admin' && recipient.institutionId !== req.user.institutionId) {
        return res.status(403).json({ message: 'Forbidden: recipient belongs to another institution.' })
      }
    }

    const notification = await createNotification({
      institutionId,
      senderId: req.user.id,
      recipientId: recipient_id ? Number(recipient_id) : null,
      title: String(title),
      message: String(message),
      category: category || 'general',
      channel: channel || 'in-app',
      is_global: Boolean(is_global),
    })

    res.status(201).json(notification)
  } catch (error) {
    console.error('Failed to create notification:', error)
    res.status(400).json({ message: error.message || 'Unable to create notification.' })
  }
})

router.post('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await getNotificationById(req.params.id)
    if (!enforceInstitutionAccess(notification, req, res)) {
      return
    }

    if (notification.recipientId && notification.recipientId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: not the recipient.' })
    }

    await markNotificationRead(notification.id, req.user.id)
    res.status(204).send()
  } catch (error) {
    console.error('Failed to mark notification read:', error)
    res.status(500).json({ message: 'Unable to mark notification as read.' })
  }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const notification = await getNotificationById(req.params.id)
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    await deleteNotification(notification.id)
    res.status(204).send()
  } catch (error) {
    console.error('Failed to delete notification:', error)
    res.status(500).json({ message: 'Unable to delete notification.' })
  }
})

export default router

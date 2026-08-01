import prisma from '../../prisma.js'

export async function createNotification({
  institutionId,
  senderId,
  recipientId = null,
  title,
  message,
  category = 'general',
  channel = 'in-app',
  is_global = false,
}) {
  return prisma.notification.create({
    data: {
      institutionId,
      senderId,
      recipientId,
      title,
      message,
      category,
      channel,
      is_global,
    },
  })
}

export async function getNotificationsForUser(user, options = {}) {
  const where = {
    institutionId: user.role === 'admin' ? undefined : user.institutionId,
    OR: [
      { recipientId: user.id },
      { recipientId: null },
    ],
  }

  if (options.unread === true) {
    where.reads = { none: { userId: user.id } }
  }
  if (options.category) {
    where.category = String(options.category)
  }

  return prisma.notification.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      sender: { select: { id: true, full_name: true } },
      recipient: { select: { id: true, full_name: true } },
      reads: { where: { userId: user.id }, select: { id: true, read_at: true } },
    },
  })
}

export async function getNotificationById(notificationId) {
  return prisma.notification.findUnique({
    where: { id: Number(notificationId) },
    include: {
      sender: { select: { id: true, full_name: true } },
      recipient: { select: { id: true, full_name: true } },
      reads: true,
    },
  })
}

export async function markNotificationRead(notificationId, userId) {
  return prisma.notificationRead.upsert({
    where: {
      notificationId_userId: {
        notificationId: Number(notificationId),
        userId: Number(userId),
      },
    },
    update: { read_at: new Date() },
    create: {
      notificationId: Number(notificationId),
      userId: Number(userId),
      read_at: new Date(),
    },
  })
}

export async function deleteNotification(notificationId) {
  return prisma.notification.delete({ where: { id: Number(notificationId) } })
}

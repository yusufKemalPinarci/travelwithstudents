const prisma = require('../config/prisma')

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    // Kullanıcının bildirimlerini çek
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    res.json(notification)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id

    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { isRead: true }
    })

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all as read:', error)
    res.status(500).json({ error: 'Failed to mark all as read' })
  }
}

const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message } = req.body

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        isRead: false
      }
    })

    res.status(201).json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    res.status(500).json({ error: 'Failed to create notification' })
  }
}

const getNotification = async (req, res) => {
  try {
    const { id } = req.params
    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    // Security check
    if (notification.userId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' })
    }

    res.json(notification)
  } catch (error) {
    console.error('Error fetching notification:', error)
    res.status(500).json({ error: 'Failed to fetch notification' })
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const notification = await prisma.notification.findUnique({
        where: { id }
    })

    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' })
    }

    if (notification.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized' })
    }

    await prisma.notification.delete({
        where: { id }
    })

    res.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Failed to delete notification' })
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getNotification,
  deleteNotification
}

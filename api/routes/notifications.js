const express = require('express')
const router = express.Router()
const authenticateJWT = require('../middleware/auth')
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getNotification,
  deleteNotification
} = require('../controllers/notificationController')

router.use(authenticateJWT)

// GET /api/notifications
router.get('/', getNotifications)

// POST /api/notifications
router.post('/', createNotification)

// PUT /api/notifications/read-all
router.put('/read-all', markAllAsRead)

// PUT /api/notifications/:id/read
router.put('/:id/read', markAsRead)

// GET /api/notifications/:id
router.get('/:id', getNotification)

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification)

module.exports = router

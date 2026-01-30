const express = require('express')
const router = express.Router()
const authenticateJWT = require('../middleware/auth')
const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllTransactions,
  getAllReviews,
  deleteReview,
  getAllBookings,
  updateBookingStatus,
  getDisputeEvidence,
  resolveDispute,
  initiateDisputeChat
} = require('../controllers/adminController')

router.use(authenticateJWT)

// User management
router.get('/users', getAllUsers)
router.put('/users/:userId/status', updateUserStatus)
router.delete('/users/:userId', deleteUser)

// Transaction management
router.get('/transactions', getAllTransactions)

// Review management
router.get('/reviews', getAllReviews)
router.delete('/reviews/:reviewId', deleteReview)

// Booking management
router.get('/bookings', getAllBookings)
router.get('/disputes/:bookingId/evidence', getDisputeEvidence)
router.post('/disputes/:bookingId/resolve', resolveDispute)
router.post('/disputes/:bookingId/chat', initiateDisputeChat)


router.put('/bookings/:bookingId/status', updateBookingStatus)

module.exports = router

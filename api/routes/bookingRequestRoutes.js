const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  createBookingRequest,
  getMyBookingRequests,
  respondToBookingRequest,
  completeRequestPayment,
  cancelBookingRequest,
  expireOldRequests,
} = require('../controllers/bookingRequestController');

// Protected routes
router.post('/', authenticateJWT, createBookingRequest);
router.get('/', authenticateJWT, getMyBookingRequests);
router.put('/:id', authenticateJWT, respondToBookingRequest);
router.post('/:id/payment', authenticateJWT, completeRequestPayment);
router.delete('/:id', authenticateJWT, cancelBookingRequest);

// Internal cron job route
router.post('/expire', expireOldRequests);

module.exports = router;

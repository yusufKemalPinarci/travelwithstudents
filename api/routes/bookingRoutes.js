const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  confirmAttendance,
} = require('../controllers/bookingController');

// All routes require authentication
router.use(authenticateJWT);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.patch('/:id/confirm-attendance', confirmAttendance);
router.delete('/:id', cancelBooking);

module.exports = router;

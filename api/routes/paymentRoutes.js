const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  createPayment,
  confirmAttendance,
  getPaymentByBooking,
  cancelAndRefund,
} = require('../controllers/paymentController');

router.use(authenticateJWT);

// Payment routes
router.post('/create', createPayment);
router.put('/confirm-attendance/:bookingId', confirmAttendance);
router.get('/booking/:bookingId', getPaymentByBooking);
router.post('/cancel/:bookingId', cancelAndRefund);

module.exports = router;

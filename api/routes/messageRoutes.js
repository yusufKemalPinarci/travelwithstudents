const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getMessages,
  markAsRead,
  acceptBookingProposal,
} = require('../controllers/messageController');

router.use(authenticateJWT);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations/:userId', getUserConversations);
router.post('/', sendMessage);
router.get('/:conversationId', getMessages);
router.put('/read/:conversationId', markAsRead);
router.put('/:messageId/accept-booking', acceptBookingProposal);

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  createReview,
  getGuideReviews,
  updateReview,
  deleteReview,
  replyToReview,
} = require('../controllers/reviewController');

router.get('/guide/:guideId', getGuideReviews);

router.use(authenticateJWT);

router.post('/', createReview);
router.post('/:id/reply', replyToReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllGuides,
  getGuideById,
  getGuidesByCity,
  updateGuideProfile,
  uploadGallery,
  getGuideAvailability
} = require('../controllers/guideController');

// Public routes
router.get('/', getAllGuides);
router.get('/:id', getGuideById);
router.get('/:id/availability', getGuideAvailability);
router.get('/city/:city', getGuidesByCity);

// Protected routes
router.put('/:id', authenticateJWT, updateGuideProfile);
router.post('/:id/gallery', authenticateJWT, upload.array('gallery', 10), uploadGallery);
router.put('/:id/gallery', authenticateJWT, upload.array('gallery', 10), uploadGallery);

module.exports = router;

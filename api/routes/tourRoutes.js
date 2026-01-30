const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateJWT = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);
router.get('/guide/:guideId', tourController.getGuideTours);

// Protected routes (Guide only)
router.post('/', authenticateJWT, upload.array('photos', 10), tourController.createTour);
router.put('/:id', authenticateJWT, upload.array('photos', 10), tourController.updateTour);
router.delete('/:id', authenticateJWT, tourController.deleteTour);

module.exports = router;

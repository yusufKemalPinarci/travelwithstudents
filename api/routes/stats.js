const express = require('express')
const router = express.Router()
const authenticateJWT = require('../middleware/auth')
const { getGuideStats, getAdminStats, getWalletStats } = require('../controllers/statsController')

router.use(authenticateJWT)

// GET /api/stats/guide/:guideId
router.get('/guide/:guideId', getGuideStats)

// GET /api/stats/wallet/:guideId
router.get('/wallet/:guideId', getWalletStats)

// GET /api/stats/admin
router.get('/admin', getAdminStats)

module.exports = router

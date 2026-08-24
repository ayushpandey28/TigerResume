const express = require('express');
const router = express.Router();
const { analyzeImprovement, applyImprovement } = require('../controllers/improvementController');
const { protect } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimit');

router.use(protect);

router.post('/analyze', apiLimiter, analyzeImprovement);
router.post('/optimize', apiLimiter, analyzeImprovement);
router.post('/apply', applyImprovement);

module.exports = router;



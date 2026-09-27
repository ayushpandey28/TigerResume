const express = require('express');
const router = express.Router();
const { analyzeImprovement, applyImprovement } = require('../controllers/improvementController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/analyze', analyzeImprovement);
router.post('/optimize', analyzeImprovement);
router.post('/apply', applyImprovement);

module.exports = router;



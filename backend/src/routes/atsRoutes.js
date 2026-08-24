const express = require('express');
const router = express.Router();
const { calculateScore, getHistory, getScore } = require('../controllers/atsController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/analyze', calculateScore);
router.post('/calculate', calculateScore);
router.get('/history', getHistory);
router.get('/:id', getScore);

module.exports = router;



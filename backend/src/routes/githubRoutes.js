const express = require('express');
const router = express.Router();
const { analyzeProfile, getHistory, getById } = require('../controllers/githubController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/analyze', analyzeProfile);
router.get('/history', getHistory);
router.get('/:id', getById);

module.exports = router;



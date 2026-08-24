const express = require('express');
const router = express.Router();
const { analyzeSkillGap, getHistory, getById } = require('../controllers/skillController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/gap', analyzeSkillGap);
router.post('/analyze', analyzeSkillGap);
router.get('/history', getHistory);
router.get('/:id', getById);

module.exports = router;



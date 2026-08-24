const express = require('express');
const router = express.Router();
const { matchJob, getMatches, getMatch } = require('../controllers/jobMatchController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', matchJob);
router.post('/match', matchJob);
router.get('/history', getMatches);
router.get('/:id', getMatch);

module.exports = router;



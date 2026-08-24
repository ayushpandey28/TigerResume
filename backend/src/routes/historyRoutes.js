const express = require('express');
const router = express.Router();
const { getHistory, getHistoryItem } = require('../controllers/historyController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getHistory);
router.get('/:id', getHistoryItem);

module.exports = router;


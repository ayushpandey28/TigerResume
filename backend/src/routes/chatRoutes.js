const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, newChat, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimit');

router.use(protect);

router.post('/message', apiLimiter, sendMessage);
router.post('/send', apiLimiter, sendMessage);
router.post('/new', newChat);
router.get('/:resumeId', getHistory);
router.delete('/:resumeId', deleteChat);

module.exports = router;



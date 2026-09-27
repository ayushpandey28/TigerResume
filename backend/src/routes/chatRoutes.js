const express = require('express');
const router = express.Router();
const { sendMessage, getHistory, newChat, deleteChat } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/message', sendMessage);
router.post('/send', sendMessage);
router.post('/new', newChat);
router.get('/:resumeId', getHistory);
router.delete('/:resumeId', deleteChat);

module.exports = router;



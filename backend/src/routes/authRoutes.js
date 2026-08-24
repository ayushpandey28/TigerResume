const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const { signupRules, loginRules, validateInput } = require('../validators/authValidator');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimit');

router.post('/signup', authLimiter, signupRules, validateInput, signup);
router.post('/login', authLimiter, loginRules, validateInput, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;



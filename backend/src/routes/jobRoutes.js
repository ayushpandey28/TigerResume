const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  analyzeJob,
  generateJob
} = require('../controllers/jobController');
const { protect } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimit');

router.use(protect);

// Basic CRUD
router.post('/', createJob);
router.get('/', getJobs);

// Generation route MUST come before /:id parameter route
router.post('/generate', apiLimiter, generateJob);

// Single item routes
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/analyze', apiLimiter, analyzeJob);

module.exports = router;



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
const { validateInput } = require('../validators/authValidator');
const { createJobRules, generateJobRules } = require('../validators/jobValidator');

router.use(protect);

// Basic CRUD
router.post('/', createJobRules, validateInput, createJob);
router.get('/', getJobs);

// Generation route MUST come before /:id parameter route
router.post('/generate', generateJobRules, validateInput, generateJob);

// Single item routes
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/analyze', analyzeJob);

module.exports = router;



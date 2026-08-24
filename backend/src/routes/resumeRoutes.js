const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  getResumeVersions,
  getResumeVersion,
  analyzeResumeWithAI,
  getResumeAnalysisHistory,
  generatePdf
} = require('../controllers/resumeController');

const { upload } = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimit');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// PDF Generation route
router.post('/:id/pdf', generatePdf);

// AI Analysis routes
router.post('/:id/analyze', apiLimiter, analyzeResumeWithAI);
router.get('/:id/analysis', getResumeAnalysisHistory);

// Versions routes
router.get('/:id/versions', getResumeVersions);
router.get('/:id/versions/:version', getResumeVersion);

module.exports = router;





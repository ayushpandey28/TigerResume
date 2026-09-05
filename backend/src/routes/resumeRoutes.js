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
  generatePdf,
  getOriginalDocument,
  updateDocumentModel,
  generateEditedPdf
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

// Original Document route (unaltered uploaded file stream / download)
router.get('/:id/original', getOriginalDocument);

// Document Model routes (generic layout editor)
router.put('/:id/document-model', updateDocumentModel);

// PDF Generation routes
router.post('/:id/pdf', generatePdf);
router.post('/:id/pdf/edited', generateEditedPdf);

// AI Analysis routes
router.post('/:id/analyze', apiLimiter, analyzeResumeWithAI);
router.get('/:id/analysis', getResumeAnalysisHistory);

// Versions routes
router.get('/:id/versions', getResumeVersions);
router.get('/:id/versions/:version', getResumeVersion);

module.exports = router;





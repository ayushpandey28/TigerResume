const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ats', 'job-match', 'optimization', 'skill-gap', 'github', 'linkedin', 'resume-analysis', 'chat'] },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  jobDescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription' },
  result: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

analysisHistorySchema.index({ userId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('AnalysisHistory', analysisHistorySchema);

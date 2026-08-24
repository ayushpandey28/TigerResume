const mongoose = require('mongoose');

const atsResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobDescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription'
  },
  overallScore: {
    type: Number,
    required: true
  },
  breakdown: {
    keywordMatch: { type: Number, default: 0 },
    skillsMatch: { type: Number, default: 0 },
    structure: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    contact: { type: Number, default: 0 },
    sections: { type: Number, default: 0 }
  },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  suggestions: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ATSResult', atsResultSchema);


const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema({
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
    ref: 'JobDescription',
    required: true
  },
  matchPercentage: {
    type: Number,
    required: true
  },
  breakdown: {
    skills: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
    projects: { type: Number, default: 0 }
  },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  missingPreferredSkills: [{ type: String }],
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  experienceMatch: {
    score: { type: Number, default: 0 },
    status: { type: String, default: 'not_specified' }
  },
  educationMatch: {
    score: { type: Number, default: 0 },
    status: { type: String, default: 'not_specified' }
  },
  projectRelevance: {
    score: { type: Number, default: 0 }
  },
  strengths: [{ type: String }],
  gaps: [{ type: String }],
  suggestions: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('JobMatch', jobMatchSchema);


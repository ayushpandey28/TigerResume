const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema({
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
  existingSkills: [{ type: String }],
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  matchedRequiredSkills: [{ type: String }],
  missingRequiredSkills: [{ type: String }],
  matchedPreferredSkills: [{ type: String }],
  missingPreferredSkills: [{ type: String }],
  skillCoverage: {
    type: Number,
    required: true,
    default: 0
  },
  gaps: [{
    skill: { type: String },
    type: { type: String, enum: ['required', 'preferred'], default: 'required' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    reason: { type: String }
  }],
  roadmap: [{
    skill: { type: String },
    priority: { type: String },
    steps: [{ type: String }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillGap', skillGapSchema);


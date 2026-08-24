const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  rawText: {
    type: String,
    default: ''
  },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  keywords: [{ type: String }],
  responsibilities: [{ type: String }],
  experience: { type: String, default: 'Not specified' },
  education: { type: String, default: 'Not specified' },
  parsedData: { type: mongoose.Schema.Types.Mixed },
  isAIGenerated: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);


const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema({
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  changes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

resumeVersionSchema.index({ resume: 1, version: -1 });
resumeVersionSchema.index({ user: 1 });

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);


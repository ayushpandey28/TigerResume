const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Resume'
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  filePublicId: {
    type: String
  },
  fileType: {
    type: String,
    default: 'application/pdf'
  },
  fileSize: {
    type: Number
  },
  extractedText: {
    type: String
  },
  contact: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  summary: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  education: [{
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
    details: { type: String, default: '' }
  }],
  experience: [{
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  projects: [{
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    link: { type: String, default: '' }
  }],
  certifications: [{
    type: String
  }],
  currentVersion: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);


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
  originalDocument: {
    storagePath: { type: String, default: '' },
    originalFileName: { type: String, default: '' },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    pageCount: { type: Number, default: 1 },
    fileUrl: { type: String, default: '' }
  },
  originalFileBuffer: {
    type: Buffer,
    select: false
  },
  documentModel: {
    type: mongoose.Schema.Types.Mixed,
    default: null
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
    github: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  summary: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  skillCategories: [{
    name: { type: String, default: '' },
    skills: [{ type: String }]
  }],
  education: [{
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    cgpa: { type: String, default: '' },
    details: { type: String, default: '' }
  }],
  experience: [{
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    duration: { type: String, default: '' },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
    bullets: [{ type: String }]
  }],
  projects: [{
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    link: { type: String, default: '' },
    bullets: [{ type: String }]
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


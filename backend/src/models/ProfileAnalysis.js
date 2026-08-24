const mongoose = require('mongoose');

const profileAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileType: {
    type: String,
    enum: ['github', 'linkedin'],
    required: true
  },
  profileUrl: {
    type: String
  },
  username: {
    type: String
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProfileAnalysis', profileAnalysisSchema);

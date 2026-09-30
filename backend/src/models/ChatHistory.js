//thisis for chat history
const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
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
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

chatHistorySchema.index({ resume: 1, user: 1 });
chatHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);


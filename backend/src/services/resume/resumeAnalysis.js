const Resume = require('../../models/Resume');
const AnalysisHistory = require('../../models/AnalysisHistory');
const aiService = require('../ai/aiService');

const analyzeResume = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) {
    throw new Error('Resume not found or unauthorized');
  }

  if (!aiService.isAIAvailable()) {
    return {
      available: false,
      message: 'AI analysis is currently unavailable. You can still use the ATS analysis.'
    };
  }

  // Delegate to replaceable AI abstraction layer
  const aiResult = await aiService.analyzeResume({
    title: resume.title,
    contact: resume.contact,
    summary: resume.summary,
    skills: resume.skills,
    education: resume.education,
    experience: resume.experience,
    projects: resume.projects,
    certifications: resume.certifications,
    extractedText: resume.extractedText
  });

  if (aiResult.available === false) {
    return aiResult;
  }

  // Save in AnalysisHistory
  const historyRecord = await AnalysisHistory.create({
    userId,
    type: 'resume-analysis',
    resumeId: resume._id,
    result: aiResult,
    provider: 'gemini'
  });

  return {
    available: true,
    historyId: historyRecord._id,
    analysis: aiResult
  };
};

const getAnalysisHistory = async (resumeId, userId) => {
  return AnalysisHistory.find({
    resumeId,
    userId,
    type: 'resume-analysis'
  }).sort({ createdAt: -1 });
};

module.exports = { analyzeResume, getAnalysisHistory };


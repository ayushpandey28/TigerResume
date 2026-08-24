const gemini = require('../../config/gemini');
const geminiService = require('./geminiService');
const logger = require('../../utils/logger');

const isAIAvailable = () => gemini.isAvailable();

const analyzeResume = async (resumeText) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.analyzeResume(resumeText);
};

const analyzeJobDescription = async (jobText) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.analyzeJobDescription(jobText);
};

const matchResumeToJob = async (resumeData, jobData) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.matchResumeToJob(resumeData, jobData);
};

const optimizeResume = async (resumeData, jobData) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.optimizeResume(resumeData, jobData);
};

const generateJobDescription = async (data) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.generateJobDescription(data);
};


const chatAboutResume = async (payload) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.chatAboutResume(payload);
};


const analyzeGitHub = async (profileData) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.analyzeGitHub(profileData);
};

const analyzeLinkedIn = async (profileData) => {
  if (!isAIAvailable()) return { available: false, message: 'AI service is not configured' };
  return geminiService.analyzeLinkedIn(profileData);
};

module.exports = {
  isAIAvailable,
  analyzeResume,
  analyzeJobDescription,
  matchResumeToJob,
  optimizeResume,
  generateJobDescription,
  chatAboutResume,
  analyzeGitHub,
  analyzeLinkedIn
};

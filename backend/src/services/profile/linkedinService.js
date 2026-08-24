const ProfileAnalysis = require('../../models/ProfileAnalysis');
const aiService = require('../ai/aiService');

const analyzeLinkedInProfile = async ({ profileUrl, headline = '', about = '', skills = [], experience = [], education = [], projects = [] }, userId) => {
  if (!profileUrl || typeof profileUrl !== 'string') {
    throw new Error('Valid LinkedIn profile URL is required');
  }

  // Sanitize URL
  const cleanUrl = profileUrl.trim();
  if (!cleanUrl.includes('linkedin.com/')) {
    throw new Error('Please provide a valid LinkedIn profile URL (e.g. https://www.linkedin.com/in/username/)');
  }

  // 1. Calculate Profile Completeness (0 - 100%)
  let completeness = 0;
  if (headline.trim()) completeness += 15;
  if (about.trim()) completeness += 20;
  if (Array.isArray(skills) && skills.length > 0) completeness += 20;
  if (Array.isArray(experience) && experience.length > 0) completeness += 20;
  if (Array.isArray(education) && education.length > 0) completeness += 15;
  if (Array.isArray(projects) && projects.length > 0) completeness += 10;

  // 2. Deterministic Strengths, Gaps & Suggestions
  const strengths = [];
  const gaps = [];
  const suggestions = [];

  if (headline.trim()) {
    if (headline.length > 15) {
      strengths.push('Headline clearly defines professional role');
    } else {
      gaps.push('Headline is too short or generic');
      suggestions.push('Expand your headline to include target role, core skills, and primary technologies (e.g., "Full-Stack Engineer | React & Node.js").');
    }
  } else {
    gaps.push('LinkedIn headline is missing');
    suggestions.push('Add a compelling headline showcasing your primary skills and target job title.');
  }

  if (about.trim()) {
    if (about.length >= 50) {
      strengths.push('About section provides a solid professional overview');
    } else {
      gaps.push('About summary is brief');
      suggestions.push('Expand your About summary to 2-3 paragraphs detailing your background, key projects, and career passion.');
    }
  } else {
    gaps.push('About section is missing');
    suggestions.push('Write a professional About summary introducing yourself and key technical strengths.');
  }

  if (Array.isArray(skills) && skills.length >= 5) {
    strengths.push(`Lists ${skills.length} technical & professional skills`);
  } else {
    gaps.push('Few or no skills listed on profile');
    suggestions.push('Add at least 5-10 core skills matching your target job description.');
  }

  // 3. Optional AI Analysis
  let aiAnalysis = null;
  if (aiService.isAIAvailable()) {
    aiAnalysis = await aiService.analyzeLinkedInProfile({
      profileUrl: cleanUrl,
      headline,
      about,
      skills,
      experience,
      education,
      completeness
    });
  }

  const analysisPayload = {
    profileType: 'linkedin',
    user: userId,
    profileUrl: cleanUrl,
    analysis: {
      profileUrl: cleanUrl,
      completeness,
      headline: headline || 'Not provided',
      about: about || 'Not provided',
      skillsCount: skills.length,
      experienceCount: experience.length,
      educationCount: education.length,
      strengths,
      gaps,
      suggestions,
      aiAnalysis: aiAnalysis?.available === false ? null : aiAnalysis
    }
  };

  const record = await ProfileAnalysis.create(analysisPayload);
  return record;
};

const getLinkedInHistory = async (userId) => {
  return ProfileAnalysis.find({ user: userId, profileType: 'linkedin' }).sort({ createdAt: -1 });
};

const getLinkedInAnalysisById = async (id, userId) => {
  const record = await ProfileAnalysis.findOne({ _id: id, user: userId, profileType: 'linkedin' });
  if (!record) throw new Error('LinkedIn profile analysis not found');
  return record;
};

module.exports = {
  analyzeLinkedInProfile,
  getLinkedInHistory,
  getLinkedInAnalysisById
};


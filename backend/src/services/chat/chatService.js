const Resume = require('../../models/Resume');
const JobDescription = require('../../models/JobDescription');
const ATSResult = require('../../models/ATSResult');
const JobMatch = require('../../models/JobMatch');
const SkillGap = require('../../models/SkillGap');
const ProfileAnalysis = require('../../models/ProfileAnalysis');
const ChatHistory = require('../../models/ChatHistory');
const aiService = require('../ai/aiService');

const sendMessage = async ({ resumeId, jobDescriptionId, message }, userId) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message content is required');
  }

  // 1. Verify Resume Ownership
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  // 2. Verify Optional Job Description Ownership
  let jobDescription = null;
  if (jobDescriptionId) {
    jobDescription = await JobDescription.findOne({ _id: jobDescriptionId, user: userId });
    if (!jobDescription) throw new Error('Job description not found or unauthorized');
  }

  // 3. Check AI Availability
  if (!aiService.isAIAvailable()) {
    return {
      available: false,
      message: 'AI assistant is currently unavailable.'
    };
  }

  // 4. Load Associated Context Records (ATS, JobMatch, SkillGap, Profiles)
  const atsResult = await ATSResult.findOne({ resume: resume._id, user: userId }).sort({ createdAt: -1 });
  const jobMatchResult = jobDescription ? await JobMatch.findOne({ resume: resume._id, jobDescription: jobDescription._id, user: userId }).sort({ createdAt: -1 }) : null;
  const skillGapResult = jobDescription ? await SkillGap.findOne({ resume: resume._id, jobDescription: jobDescription._id, user: userId }).sort({ createdAt: -1 }) : null;
  const profiles = await ProfileAnalysis.find({ user: userId }).sort({ createdAt: -1 }).limit(2);

  // 5. Load Chat Session & Recent History (Last 10 messages for context)
  let chatRecord = await ChatHistory.findOne({ resume: resume._id, user: userId });
  if (!chatRecord) {
    chatRecord = new ChatHistory({
      user: userId,
      resume: resume._id,
      jobDescription: jobDescription ? jobDescription._id : undefined,
      messages: []
    });
  }

  const recentHistory = (chatRecord.messages || []).slice(-10).map(m => ({
    role: m.role,
    content: m.content
  }));

  // 6. Build Context Payload & Invoke AI Service
  const resumePayload = {
    title: resume.title,
    summary: resume.summary,
    skills: resume.skills,
    experience: resume.experience,
    projects: resume.projects,
    education: resume.education,
    certifications: resume.certifications
  };

  const jobPayload = jobDescription ? {
    title: jobDescription.title,
    company: jobDescription.company,
    requiredSkills: jobDescription.requiredSkills,
    preferredSkills: jobDescription.preferredSkills,
    responsibilities: jobDescription.responsibilities
  } : null;

  const contextPayload = {
    resumeData: resumePayload,
    jobData: jobPayload,
    atsData: atsResult ? { score: atsResult.score, missingKeywords: atsResult.missingKeywords } : null,
    jobMatchData: jobMatchResult ? { matchPercentage: jobMatchResult.matchPercentage, matchedSkills: jobMatchResult.matchedSkills, missingSkills: jobMatchResult.missingSkills } : null,
    skillGapData: skillGapResult ? { skillCoverage: skillGapResult.skillCoverage, missingRequiredSkills: skillGapResult.missingRequiredSkills } : null,
    profileData: profiles.length > 0 ? profiles.map(p => ({ type: p.profileType, url: p.profileUrl, data: p.analysis })) : null,
    chatHistory: recentHistory,
    userQuestion: message.trim()
  };

  const aiReply = await aiService.chatAboutResume(contextPayload);
  const replyText = typeof aiReply === 'string' ? aiReply : (aiReply?.message || 'I could not process your question.');

  // 7. Save Conversation
  chatRecord.messages.push({ role: 'user', content: message.trim() });
  chatRecord.messages.push({ role: 'assistant', content: replyText });
  if (jobDescription) chatRecord.jobDescription = jobDescription._id;
  await chatRecord.save();

  return {
    available: true,
    message: replyText,
    history: chatRecord.messages
  };
};

const getHistoryByResumeId = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  const record = await ChatHistory.findOne({ resume: resumeId, user: userId });
  return record ? record.messages : [];
};

const createNewChat = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  let record = await ChatHistory.findOne({ resume: resumeId, user: userId });
  if (record) {
    record.messages = [];
    await record.save();
  } else {
    record = await ChatHistory.create({
      user: userId,
      resume: resume._id,
      messages: []
    });
  }

  return { success: true, messages: [] };
};

const deleteChatByResumeId = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  await ChatHistory.deleteOne({ resume: resumeId, user: userId });
  return { success: true };
};

module.exports = {
  sendMessage,
  getHistoryByResumeId,
  createNewChat,
  deleteChatByResumeId
};


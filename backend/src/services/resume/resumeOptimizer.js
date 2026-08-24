const Resume = require('../../models/Resume');
const ResumeVersion = require('../../models/ResumeVersion');
const JobDescription = require('../../models/JobDescription');
const ATSResult = require('../../models/ATSResult');
const JobMatch = require('../../models/JobMatch');
const aiService = require('../ai/aiService');

const analyzeImprovement = async (resumeId, jobDescriptionId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  let jobDescription = null;
  if (jobDescriptionId) {
    jobDescription = await JobDescription.findOne({ _id: jobDescriptionId, user: userId });
    if (!jobDescription) throw new Error('Job description not found or unauthorized');
  }

  if (!aiService.isAIAvailable()) {
    return {
      available: false,
      message: 'AI optimization service is currently unavailable.'
    };
  }

  // Load optional ATS and Match results to give richer context
  const atsResult = await ATSResult.findOne({ resume: resume._id, user: userId }).sort({ createdAt: -1 });
  const jobMatchResult = jobDescription ? await JobMatch.findOne({ resume: resume._id, jobDescription: jobDescription._id, user: userId }).sort({ createdAt: -1 }) : null;

  const resumePayload = {
    title: resume.title,
    summary: resume.summary,
    skills: resume.skills,
    experience: resume.experience,
    projects: resume.projects,
    certifications: resume.certifications,
    extractedText: resume.extractedText,
    atsMissingKeywords: atsResult?.missingKeywords || [],
    jobMatchMissingSkills: jobMatchResult?.missingSkills || []
  };

  const jobPayload = jobDescription ? {
    title: jobDescription.title,
    company: jobDescription.company,
    description: jobDescription.description || jobDescription.rawText,
    requiredSkills: jobDescription.requiredSkills,
    preferredSkills: jobDescription.preferredSkills,
    keywords: jobDescription.keywords
  } : null;

  const result = await aiService.optimizeResume(resumePayload, jobPayload);
  if (result.available === false) return result;

  return {
    available: true,
    resumeId: resume._id,
    originalVersion: resume.currentVersion || 1,
    improvements: result
  };
};

const applyImprovement = async ({ resumeId, originalVersion, acceptedChanges }, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, user: userId });
  if (!resume) throw new Error('Resume not found or unauthorized');

  // Verify original version matches or is valid
  const currentVersion = resume.currentVersion || 1;

  // Apply accepted changes strictly to allowed resume fields
  if (acceptedChanges.summary !== undefined && typeof acceptedChanges.summary === 'string') {
    resume.summary = acceptedChanges.summary.trim();
  }

  if (Array.isArray(acceptedChanges.experience)) {
    resume.experience = acceptedChanges.experience;
  }

  if (Array.isArray(acceptedChanges.projects)) {
    resume.projects = acceptedChanges.projects;
  }

  if (Array.isArray(acceptedChanges.skills)) {
    // Only update skills if provided as valid array
    resume.skills = acceptedChanges.skills;
  }

  // Increment version number
  const newVersion = currentVersion + 1;
  resume.currentVersion = newVersion;

  // Save new ResumeVersion snapshot
  await ResumeVersion.create({
    resume: resume._id,
    user: userId,
    version: newVersion,
    resumeData: {
      title: resume.title,
      contact: resume.contact,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      certifications: resume.certifications
    },
    changes: `AI Resume Optimization applied (Version ${currentVersion} -> ${newVersion})`
  });

  await resume.save();

  return {
    success: true,
    resume,
    newVersion
  };
};

module.exports = {
  analyzeImprovement,
  applyImprovement
};


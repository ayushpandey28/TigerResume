const JobDescription = require('../../models/JobDescription');
const aiService = require('../ai/aiService');

const createJobDescription = async (data, userId) => {
  const { title, company, description, rawText } = data;

  const jd = await JobDescription.create({
    user: userId,
    title,
    company: company || '',
    description: description || rawText || '',
    rawText: rawText || description || '',
    isAIGenerated: false
  });

  return jd;
};

const getJobDescriptions = async (userId) => {
  return JobDescription.find({ user: userId }).sort({ createdAt: -1 });
};

const getJobDescriptionById = async (id, userId) => {
  const jd = await JobDescription.findOne({ _id: id, user: userId });
  if (!jd) throw new Error('Job description not found or unauthorized');
  return jd;
};

const updateJobDescription = async (id, data, userId) => {
  const jd = await JobDescription.findOne({ _id: id, user: userId });
  if (!jd) throw new Error('Job description not found or unauthorized');

  if (data.title) jd.title = data.title;
  if (data.company !== undefined) jd.company = data.company;
  if (data.description) {
    jd.description = data.description;
    jd.rawText = data.description;
  }
  if (data.requiredSkills) jd.requiredSkills = data.requiredSkills;
  if (data.preferredSkills) jd.preferredSkills = data.preferredSkills;
  if (data.keywords) jd.keywords = data.keywords;
  if (data.responsibilities) jd.responsibilities = data.responsibilities;
  if (data.experience) jd.experience = data.experience;
  if (data.education) jd.education = data.education;

  await jd.save();
  return jd;
};

const deleteJobDescription = async (id, userId) => {
  const jd = await JobDescription.findOneAndDelete({ _id: id, user: userId });
  if (!jd) throw new Error('Job description not found or unauthorized');
  return jd;
};

const analyzeJobDescription = async (id, userId) => {
  const jd = await JobDescription.findOne({ _id: id, user: userId });
  if (!jd) throw new Error('Job description not found or unauthorized');

  if (!aiService.isAIAvailable()) {
    return {
      available: false,
      message: 'AI analysis is currently unavailable. You can still manually view, edit, and save Job Descriptions.'
    };
  }

  const analysis = await aiService.analyzeJobDescription(jd.description || jd.rawText || jd.title);
  if (analysis.available === false) return analysis;

  jd.parsedData = analysis;
  if (analysis.title && !jd.title) jd.title = analysis.title;
  if (analysis.company && !jd.company) jd.company = analysis.company;
  jd.requiredSkills = analysis.requiredSkills || [];
  jd.preferredSkills = analysis.preferredSkills || [];
  jd.keywords = analysis.keywords || [];
  jd.responsibilities = analysis.responsibilities || [];
  if (analysis.experience) jd.experience = analysis.experience;
  if (analysis.education) jd.education = analysis.education;

  await jd.save();
  return { available: true, jobDescription: jd };
};

const generateJobDescription = async (inputData, userId) => {
  if (!aiService.isAIAvailable()) {
    return {
      available: false,
      message: 'AI sample generation is currently unavailable.'
    };
  }

  const generated = await aiService.generateJobDescription(inputData);
  if (generated.available === false) return generated;

  const jd = await JobDescription.create({
    user: userId,
    title: generated.title || inputData.jobTitle,
    company: '', // Clearly sample company / unassigned
    description: generated.description || '',
    rawText: generated.description || '',
    requiredSkills: generated.requiredSkills || [],
    preferredSkills: generated.preferredSkills || [],
    keywords: generated.keywords || [],
    responsibilities: generated.responsibilities || [],
    experience: generated.experience || inputData.experienceLevel || 'Entry Level',
    education: generated.education || "Bachelor's degree",
    parsedData: generated,
    isAIGenerated: true
  });

  return { available: true, jobDescription: jd };
};

module.exports = {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById,
  updateJobDescription,
  deleteJobDescription,
  analyzeJobDescription,
  generateJobDescription
};


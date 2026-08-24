const gemini = require('../../config/gemini');
const prompts = require('./prompts');
const logger = require('../../utils/logger');

const callGemini = async (prompt) => {
  try {
    const model = gemini.getModel();
    if (!model) throw new Error('Gemini model not available');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Response did not contain valid JSON');
  } catch (err) {
    logger.error('Gemini API call failed:', err.message);
    throw new Error(`AI processing failed: ${err.message}`);
  }
};

const callGeminiText = async (prompt) => {
  try {
    const model = gemini.getModel();
    if (!model) throw new Error('Gemini model not available');

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (err) {
    logger.error('Gemini API call failed:', err.message);
    throw new Error(`AI processing failed: ${err.message}`);
  }
};


const analyzeResume = async (resumeData) => {
  const prompt = prompts.resumeAnalysis(resumeData);
  const rawResponse = await callGemini(prompt);
  return validateResumeAnalysisResponse(rawResponse);
};

// Response Validator & Normalizer
const validateResumeAnalysisResponse = (res) => {
  if (!res || typeof res !== 'object') {
    res = {};
  }

  const toArray = (val) => (Array.isArray(val) ? val : typeof val === 'string' && val ? [val] : []);

  return {
    overall_assessment: typeof res.overall_assessment === 'string' ? res.overall_assessment : 'Resume analysis completed.',
    strengths: toArray(res.strengths),
    weaknesses: toArray(res.weaknesses),
    skills_analysis: {
      strong_skills: toArray(res.skills_analysis?.strong_skills),
      skills_to_highlight: toArray(res.skills_analysis?.skills_to_highlight),
      skills_that_need_context: toArray(res.skills_analysis?.skills_that_need_context)
    },
    experience_analysis: {
      strengths: toArray(res.experience_analysis?.strengths),
      improvements: toArray(res.experience_analysis?.improvements)
    },
    project_analysis: {
      strengths: toArray(res.project_analysis?.strengths),
      improvements: toArray(res.project_analysis?.improvements)
    },
    section_feedback: {
      summary: typeof res.section_feedback?.summary === 'string' ? res.section_feedback.summary : '',
      skills: typeof res.section_feedback?.skills === 'string' ? res.section_feedback.skills : '',
      education: typeof res.section_feedback?.education === 'string' ? res.section_feedback.education : '',
      experience: typeof res.section_feedback?.experience === 'string' ? res.section_feedback.experience : '',
      projects: typeof res.section_feedback?.projects === 'string' ? res.section_feedback.projects : '',
      certifications: typeof res.section_feedback?.certifications === 'string' ? res.section_feedback.certifications : ''
    },
    suggestions: toArray(res.suggestions)
  };
};


const analyzeJobDescription = async (jobText) => {
  const prompt = prompts.jobDescriptionAnalysis(jobText);
  const rawResponse = await callGemini(prompt);
  return validateJDAnalysisResponse(rawResponse);
};

const generateJobDescription = async (data) => {
  const prompt = prompts.jobDescriptionGeneration(data);
  const rawResponse = await callGemini(prompt);
  return validateJDGenerationResponse(rawResponse, data);
};

const validateJDAnalysisResponse = (res) => {
  if (!res || typeof res !== 'object') res = {};
  const toArray = (val) => (Array.isArray(val) ? val : typeof val === 'string' && val ? [val] : []);

  return {
    title: typeof res.title === 'string' && res.title ? res.title : 'Job Position',
    company: typeof res.company === 'string' ? res.company : '',
    summary: typeof res.summary === 'string' ? res.summary : '',
    requiredSkills: toArray(res.required_skills || res.requiredSkills),
    preferredSkills: toArray(res.preferred_skills || res.preferredSkills),
    keywords: toArray(res.keywords),
    responsibilities: toArray(res.responsibilities),
    experience: typeof res.experience === 'string' && res.experience ? res.experience : 'Not specified',
    education: typeof res.education === 'string' && res.education ? res.education : 'Not specified'
  };
};

const validateJDGenerationResponse = (res, inputData) => {
  if (!res || typeof res !== 'object') res = {};
  const toArray = (val) => (Array.isArray(val) ? val : typeof val === 'string' && val ? [val] : []);

  return {
    title: inputData?.jobTitle || res.title || 'Sample Role',
    company: '',
    description: typeof res.description === 'string' ? res.description : `Sample job description for ${inputData?.jobTitle || 'role'}.`,
    requiredSkills: toArray(res.required_skills || res.requiredSkills),
    preferredSkills: toArray(res.preferred_skills || res.preferredSkills),
    keywords: toArray(res.keywords),
    responsibilities: toArray(res.responsibilities),
    experience: inputData?.experienceLevel || res.experience || 'Entry Level',
    education: typeof res.education === 'string' ? res.education : "Bachelor's degree",
    isAIGenerated: true
  };
};


const matchResumeToJob = async (resumeData, jobData) => {
  const prompt = prompts.jobMatching(resumeData, jobData);
  return callGemini(prompt);
};

const optimizeResume = async (resumeData, jobData) => {
  const prompt = prompts.resumeOptimization(resumeData, jobData);
  const rawResponse = await callGemini(prompt);
  return validateResumeOptimizationResponse(rawResponse);
};

const validateResumeOptimizationResponse = (res) => {
  if (!res || typeof res !== 'object') res = {};
  const toArray = (val) => (Array.isArray(val) ? val : typeof val === 'string' && val ? [val] : []);

  return {
    summary: {
      original: typeof res.summary?.original === 'string' ? res.summary.original : '',
      improved: typeof res.summary?.improved === 'string' ? res.summary.improved : '',
      reason: typeof res.summary?.reason === 'string' ? res.summary.reason : 'Improved role focus and clarity.'
    },
    experience: Array.isArray(res.experience) ? res.experience.map(e => ({
      original: typeof e.original === 'string' ? e.original : '',
      improved: typeof e.improved === 'string' ? e.improved : '',
      reason: typeof e.reason === 'string' ? e.reason : 'Strengthened action verbs and impact.'
    })) : [],
    projects: Array.isArray(res.projects) ? res.projects.map(p => ({
      original: typeof p.original === 'string' ? p.original : '',
      improved: typeof p.improved === 'string' ? p.improved : '',
      reason: typeof p.reason === 'string' ? p.reason : 'Enhanced technical clarity and contribution.'
    })) : [],
    skills: {
      current: toArray(res.skills?.current),
      recommended_to_highlight: toArray(res.skills?.recommended_to_highlight),
      reason: typeof res.skills?.reason === 'string' ? res.skills.reason : ''
    },
    section_improvements: toArray(res.section_improvements),
    keyword_suggestions: toArray(res.keyword_suggestions),
    overall_suggestions: toArray(res.overall_suggestions)
  };
};




const chatAboutResume = async (payload) => {
  const prompt = prompts.resumeChat(payload);
  return callGeminiText(prompt);
};


const analyzeGitHub = async (profileData) => {
  const prompt = prompts.githubAnalysis(profileData);
  return callGemini(prompt);
};

const analyzeLinkedIn = async (profileData) => {
  const prompt = prompts.linkedinAnalysis(profileData);
  return callGemini(prompt);
};

module.exports = {
  analyzeResume,
  analyzeJobDescription,
  matchResumeToJob,
  optimizeResume,
  generateJobDescription,
  chatAboutResume,
  analyzeGitHub,
  analyzeLinkedIn,
  validateResumeAnalysisResponse,
  validateJDAnalysisResponse,
  validateJDGenerationResponse,
  validateResumeOptimizationResponse
};




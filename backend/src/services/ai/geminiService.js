const gemini = require('../../config/gemini');
const prompts = require('./prompts');
const logger = require('../../utils/logger');

const wait = (ms) => new Promise(res => setTimeout(res, ms));

const GEMINI_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 12000;
const GEMINI_MAX_RETRIES = 2; // Maximum 2 attempts total (1 initial + 1 retry)

const withTimeout = (promise, timeoutMs = GEMINI_TIMEOUT_MS) => {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('Gemini API call timed out');
      err.code = 'TIMEOUT';
      reject(err);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
};

const formatAIError = (err) => {
  const msg = err?.message || '';
  const isBusy = msg.includes('503') ||
    msg.includes('high demand') ||
    msg.includes('Service Unavailable') ||
    msg.includes('429') ||
    msg.includes('Resource has been exhausted') ||
    err?.code === 'TIMEOUT' ||
    msg.includes('timed out');

  if (isBusy) {
    const error = new Error('AI service is temporarily busy. Please try again in a moment.');
    error.statusCode = 503;
    error.isAIBusy = true;
    return error;
  }

  const error = new Error(`AI processing failed: ${msg}`);
  error.statusCode = 500;
  return error;
};

const parseJSONSafely = (text) => {
  if (!text || typeof text !== 'string') return {};
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        const sanitized = match[0].replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(sanitized);
      }
    }
    throw new Error('Response did not contain valid JSON');
  }
};

const callGemini = async (prompt, maxRetries = GEMINI_MAX_RETRIES) => {
  let activeModel = gemini.getModel();
  if (!activeModel) {
    const err = new Error('AI service is not configured or unavailable');
    err.statusCode = 503;
    throw err;
  }

  let lastError = null;
  let usedFallback = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(activeModel.generateContent(prompt));
      const response = result.response;
      const text = response.text();

      return parseJSONSafely(text);
    } catch (err) {
      lastError = err;

      // If configured model returned 404 / unavailable, seamlessly try fallback model
      const isModelError = err.message && (
        err.message.includes('404') ||
        err.message.includes('not found') ||
        err.message.includes('no longer available')
      );

      if (isModelError && !usedFallback) {
        const fallback = gemini.getFallbackModel();
        if (fallback) {
          logger.warn('Primary Gemini model unavailable, switching to fallback model...');
          activeModel = fallback;
          usedFallback = true;
          attempt--;
          continue;
        }
      }

      const isTemporary = err.message && (
        err.message.includes('503') ||
        err.message.includes('high demand') ||
        err.message.includes('429') ||
        err.code === 'TIMEOUT'
      );

      if (isTemporary && attempt < maxRetries) {
        const delay = 1500; // Fast bounded delay of 1.5s
        logger.warn(`Gemini API busy (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }

      logger.error('Gemini API call failed:', err.message);
      throw formatAIError(err);
    }
  }

  throw formatAIError(lastError);
};

const callGeminiText = async (prompt, maxRetries = GEMINI_MAX_RETRIES) => {
  let activeModel = gemini.getModel();
  if (!activeModel) {
    const err = new Error('AI service is not configured or unavailable');
    err.statusCode = 503;
    throw err;
  }

  let lastError = null;
  let usedFallback = false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(activeModel.generateContent(prompt));
      const response = result.response;
      return response.text();
    } catch (err) {
      lastError = err;

      // If configured model returned 404 / unavailable, seamlessly try fallback model
      const isModelError = err.message && (
        err.message.includes('404') ||
        err.message.includes('not found') ||
        err.message.includes('no longer available')
      );

      if (isModelError && !usedFallback) {
        const fallback = gemini.getFallbackModel();
        if (fallback) {
          logger.warn('Primary Gemini model unavailable, switching to fallback model...');
          activeModel = fallback;
          usedFallback = true;
          attempt--;
          continue;
        }
      }

      const isTemporary = err.message && (
        err.message.includes('503') ||
        err.message.includes('high demand') ||
        err.message.includes('429') ||
        err.code === 'TIMEOUT'
      );

      if (isTemporary && attempt < maxRetries) {
        const delay = 1500;
        logger.warn(`Gemini API busy (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await wait(delay);
        continue;
      }

      logger.error('Gemini API call failed:', err.message);
      throw formatAIError(err);
    }
  }

  throw formatAIError(lastError);
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




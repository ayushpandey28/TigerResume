const gemini = require('../../config/gemini');
const prompts = require('./prompts');
const logger = require('../../utils/logger');

const wait = (ms) => new Promise(res => setTimeout(res, ms));

const GEMINI_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 12000;

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

/**
 * Classify whether an error is model-specific (warranting automatic failover to the next model)
 * or non-model-specific (such as authentication or invalid API key, which must throw immediately).
 */
const isModelSpecificError = (err) => {
  if (!err) return false;

  const msg = (err.message || '').toLowerCase();
  const status = err.status || err.statusCode;

  // 1. Non-model-specific failures: DO NOT FAILOVER
  // Invalid API key / Auth / Permission failures
  if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    msg.includes('invalid api key') ||
    msg.includes('unauthorized') ||
    msg.includes('permission_denied') ||
    msg.includes('permission denied') ||
    status === 401 ||
    status === 403
  ) {
    return false;
  }

  // Account-wide billing or hard quota limits
  if (
    msg.includes('billing disabled') ||
    msg.includes('account quota') ||
    msg.includes('check your plan and billing')
  ) {
    return false;
  }

  // 2. Model-specific failures: DO FAILOVER
  // Model not found / 404 / unsupported / deprecated / shutdown
  if (
    status === 404 ||
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('unsupported') ||
    msg.includes('is not supported') ||
    msg.includes('no longer available') ||
    msg.includes('deprecated') ||
    msg.includes('shutdown') ||
    msg.includes('discontinued')
  ) {
    return true;
  }

  // Model unavailable / transient overload / 503 / 429 / timeouts
  if (
    status === 503 ||
    status === 429 ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('service unavailable') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource has been exhausted') ||
    msg.includes('rate limit') ||
    err.code === 'TIMEOUT' ||
    msg.includes('timed out')
  ) {
    return true;
  }

  // Model-specific 400 (Bad request due to model capability or invalid model identifier)
  if (status === 400 || msg.includes('400') || msg.includes('invalid model')) {
    return true;
  }

  // Default: if error occurs during Gemini request, treat model failure safely
  return true;
};

/**
 * Format error for user-facing API response
 */
const formatAIError = (err) => {
  if (err && err.statusCode && err.isControlled) {
    return err;
  }

  const msg = err?.message || '';
  const isAuth =
    msg.includes('API_KEY_INVALID') ||
    msg.includes('api key not valid') ||
    msg.includes('unauthorized') ||
    msg.includes('permission');

  if (isAuth) {
    const error = new Error('AI service configuration or authentication failed.');
    error.statusCode = 401;
    error.isControlled = true;
    return error;
  }

  const error = new Error('AI service is temporarily unavailable. Please try again shortly.');
  error.statusCode = 503;
  error.isControlled = true;
  return error;
};

/**
 * Robust JSON parser for AI responses.
 * Handles fenced markdown, surrounding text, and recoverable trailing commas.
 */
const parseJSONSafely = (text) => {
  if (text === null || text === undefined || typeof text !== 'string') {
    throw new Error('Response did not contain valid text');
  }

  let cleaned = text.trim();

  // Strip markdown fencing
  cleaned = cleaned.replace(/^```(?:json|text)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 1. Direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    // 2. Extract JSON structure (object or array) from surrounding text
    const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      const extracted = match[0].trim();
      try {
        return JSON.parse(extracted);
      } catch (err2) {
        // 3. Fix recoverable trailing commas before closing braces/brackets
        try {
          const sanitized = extracted.replace(/,\s*([}\]])/g, '$1');
          return JSON.parse(sanitized);
        } catch (err3) {
          // Fall through
        }
      }
    }
  }

  throw new Error('Response did not contain valid JSON');
};

/**
 * Centralized Gemini request executor with automatic model failover.
 */
const executeWithFailover = async (prompt, options = {}) => {
  const isTextOnly = options.isTextOnly === true;
  const timeoutMs = options.timeoutMs || GEMINI_TIMEOUT_MS;

  if (!gemini.isAvailable()) {
    const err = new Error('AI service is not configured or unavailable');
    err.statusCode = 503;
    err.isControlled = true;
    throw err;
  }

  const modelChain = gemini.getModelChain();
  let lastError = null;

  for (let i = 0; i < modelChain.length; i++) {
    const modelName = modelChain[i];
    const modelInstance = gemini.getGenerativeModel(modelName);

    if (!modelInstance) {
      continue;
    }

    try {
      const result = await withTimeout(modelInstance.generateContent(prompt), timeoutMs);
      const response = result.response;
      const text = response.text();

      if (isTextOnly) {
        return text;
      }
      return parseJSONSafely(text);
    } catch (err) {
      lastError = err;

      // If JSON parsing fails specifically, do not cycle through models — payload was returned but malformed
      if (err.message === 'Response did not contain valid JSON') {
        logger.error(`JSON parsing error for response from model ${modelName}`);
        throw formatAIError(err);
      }

      const isModelError = isModelSpecificError(err);

      if (isModelError && i < modelChain.length - 1) {
        const nextModel = modelChain[i + 1];
        const safeReason = (err.message || 'model unavailable')
          .replace(/key=[^&]+/gi, 'key=***')
          .replace(/Bearer\s+[^\s]+/gi, 'Bearer ***');

        logger.warn(
          `Primary Gemini model failed (${modelName}). Reason: ${safeReason}. Trying fallback: ${nextModel}`
        );
        continue;
      }

      // Non-model error or final model failed
      if (!isModelError) {
        logger.error(`Gemini API request failed with non-model error on ${modelName}:`, err.message);
        throw formatAIError(err);
      }
    }
  }

  logger.error('All Gemini models in fallback chain failed. Last error:', lastError?.message);
  throw formatAIError(lastError);
};

const callGemini = (prompt) => executeWithFailover(prompt, { isTextOnly: false });
const callGeminiText = (prompt) => executeWithFailover(prompt, { isTextOnly: true });

// --- All 8 AI Features ---
const analyzeResume = async (resumeData) => {
  const prompt = prompts.resumeAnalysis(resumeData);
  const rawResponse = await callGemini(prompt);
  return validateResumeAnalysisResponse(rawResponse);
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

const matchResumeToJob = async (resumeData, jobData) => {
  const prompt = prompts.jobMatching(resumeData, jobData);
  return callGemini(prompt);
};

const optimizeResume = async (resumeData, jobData) => {
  const prompt = prompts.resumeOptimization(resumeData, jobData);
  const rawResponse = await callGemini(prompt);
  return validateResumeOptimizationResponse(rawResponse);
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

// --- Response Validators & Normalizers ---
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
  validateResumeOptimizationResponse,
  parseJSONSafely,
  isModelSpecificError,
  executeWithFailover,
  callGemini,
  callGeminiText
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

const logger = require('../utils/logger');

let genAI = null;
let model = null;

let rawModel = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();

// Map legacy or invalid model names to official Google Generative AI models
const validModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'];
let GEMINI_MODEL = rawModel;

if (!validModels.includes(rawModel)) {
  logger.warn(
    `Unsupported or non-standard Gemini model name "${rawModel}". Standardizing to "gemini-1.5-flash".`
  );
  GEMINI_MODEL = 'gemini-1.5-flash';
}

let fallbackModel = null;
const apiKey = process.env.GEMINI_API_KEY;

if (
  apiKey &&
  apiKey !== 'your-gemini-api-key' &&
  apiKey !== 'your_gemini_api_key_here' &&
  apiKey.trim() !== ''
) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);

    model = genAI.getGenerativeModel({
      model: GEMINI_MODEL
    });

    const fallbackModelName = GEMINI_MODEL === 'gemini-1.5-flash' ? 'gemini-2.0-flash' : 'gemini-1.5-flash';
    fallbackModel = genAI.getGenerativeModel({
      model: fallbackModelName
    });

    logger.info(
      `Gemini AI initialized successfully (${GEMINI_MODEL})`
    );
  } catch (err) {
    logger.error(
      `Gemini AI initialization failed: ${err.message}`
    );

    genAI = null;
    model = null;
    fallbackModel = null;
  }
} else {
  logger.warn(
    'Gemini API key not configured. AI features will be unavailable.'
  );
}

const isAvailable = () => {
  return model !== null;
};

const getModel = () => {
  return model;
};

const getFallbackModel = () => {
  return fallbackModel;
};

module.exports = {
  isAvailable,
  getModel,
  getFallbackModel,
  genAI,
  GEMINI_MODEL
};
const { GoogleGenerativeAI } = require('@google/generative-ai');

const logger = require('../utils/logger');

let genAI = null;
let model = null;

let GEMINI_MODEL = (
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
).trim();

if (!GEMINI_MODEL || /\s/.test(GEMINI_MODEL)) {
  logger.warn(
    `Invalid Gemini model name "${GEMINI_MODEL}". Defaulting to "gemini-3.5-flash-lite".`
  );

  GEMINI_MODEL = 'gemini-3.5-flash-lite';
}

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

    const fallbackModelName = GEMINI_MODEL === 'gemini-3.6-flash' ? 'gemini-3.5-flash-lite' : 'gemini-3.6-flash';
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
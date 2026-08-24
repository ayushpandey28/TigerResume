const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

let genAI = null;
let model = null;

const GEMINI_MODEL = 'gemini-3.6-flash';

const apiKey = process.env.GEMINI_API_KEY;

if (
  apiKey &&
  apiKey !== 'your-gemini-api-key' &&
  apiKey.trim() !== ''
) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);

    model = genAI.getGenerativeModel({
      model: GEMINI_MODEL
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

module.exports = {
  isAvailable,
  getModel,
  genAI,
  GEMINI_MODEL
};
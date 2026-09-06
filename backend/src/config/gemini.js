const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const SUPPORTED_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

const DEFAULT_PRIMARY_MODEL = 'gemini-3.5-flash-lite';

let genAIInstance = null;
let lastApiKey = null;
const modelCache = new Map();

const isPlaceholderKey = (key) => {
  if (!key) return true;

  const placeholders = [
    'your-gemini-api-key',
    'your_gemini_api_key_here',
    'your-gemini-api-key-here'
  ];

  return placeholders.includes(key);
};

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (isPlaceholderKey(key)) return null;
  return key;
};

const getClient = () => {
  const key = getApiKey();
  if (!key) return null;

  // Re-initialize if API key changed
  if (!genAIInstance || lastApiKey !== key) {
    try {
      genAIInstance = new GoogleGenerativeAI(key);
      lastApiKey = key;
      modelCache.clear();
    } catch (err) {
      logger.error(`Gemini AI client initialization failed: ${err.message}`);
      genAIInstance = null;
      lastApiKey = null;
    }
  }
  return genAIInstance;
};

const isAvailable = () => {
  return getClient() !== null;
};

/**
 * Returns the ordered model failover chain based on GEMINI_MODEL env var.
 * If GEMINI_MODEL is set and valid, it is placed first.
 * If set but unknown/unsupported, it normalizes to DEFAULT_PRIMARY_MODEL and logs a warning.
 */
const getModelChain = () => {
  const rawEnvModel = process.env.GEMINI_MODEL?.trim();
  let primaryModel = DEFAULT_PRIMARY_MODEL;

  if (rawEnvModel) {
    if (SUPPORTED_MODELS.includes(rawEnvModel)) {
      primaryModel = rawEnvModel;
    } else {
      logger.warn(
        `Configured GEMINI_MODEL '${rawEnvModel}' is unknown or unsupported. Normalizing to verified primary model '${DEFAULT_PRIMARY_MODEL}'.`
      );
    }
  }

  // Build ordered list starting with primaryModel, followed by remaining supported models
  const chain = [primaryModel];
  for (const m of SUPPORTED_MODELS) {
    if (!chain.includes(m)) {
      chain.push(m);
    }
  }

  return chain;
};

/**
 * Get generative model instance for a specific model ID (cached)
 */
const getGenerativeModel = (modelName) => {
  const client = getClient();
  if (!client || !modelName) return null;

  if (!modelCache.has(modelName)) {
    modelCache.set(modelName, client.getGenerativeModel({ model: modelName }));
  }
  return modelCache.get(modelName);
};

/**
 * Backward compatibility helper to get primary model instance
 */
const getModel = () => {
  const chain = getModelChain();
  return getGenerativeModel(chain[0]);
};

/**
 * Backward compatibility helper to get first fallback model instance
 */
const getFallbackModel = () => {
  const chain = getModelChain();
  return chain.length > 1 ? getGenerativeModel(chain[1]) : null;
};

/**
 * Resets client and cache state (used for testing and key updates)
 */
const resetForTesting = () => {
  genAIInstance = null;
  lastApiKey = null;
  modelCache.clear();
};

module.exports = {
  isAvailable,
  getModel,
  getFallbackModel,
  getGenerativeModel,
  getModelChain,
  resetForTesting,
  SUPPORTED_MODELS,
  PRIMARY_MODEL: DEFAULT_PRIMARY_MODEL,
  FALLBACK_MODEL: SUPPORTED_MODELS[1]
};
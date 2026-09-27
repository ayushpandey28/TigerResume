const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

let isConfigured = false;
const placeholders = new Set([
  'your-cloud-name',
  'your_cloudinary_cloud_name',
  'your_cloudinary_api_key',
  'your_cloudinary_api_secret'
]);
const isSetValue = (value) => value && !placeholders.has(value.trim().toLowerCase());

if (
  isSetValue(process.env.CLOUDINARY_CLOUD_NAME) &&
  isSetValue(process.env.CLOUDINARY_API_KEY) &&
  isSetValue(process.env.CLOUDINARY_API_SECRET)
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  isConfigured = true;
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary not configured. File uploads will use local storage.');
}

module.exports = { cloudinary: isConfigured ? cloudinary : null, isConfigured };

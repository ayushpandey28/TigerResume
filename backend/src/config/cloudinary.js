const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

let isConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
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

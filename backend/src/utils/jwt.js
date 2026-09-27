const jwt = require('jsonwebtoken');

const logger = require('./logger');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (
    !secret ||
    secret === 'your-jwt-secret-here' ||
    secret === 'your_jwt_secret_here' ||
    secret === 'generate_a_secure_random_64_character_string_here'
  ) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL SECURITY RISK: JWT_SECRET is missing or using default placeholder in production!');
      throw new Error('JWT_SECRET must be configured with a secure secret in production.');
    }
    return 'tiger_resume_jwt_secret_dev_key';
  }
  return secret;
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

module.exports = { generateToken, verifyToken };


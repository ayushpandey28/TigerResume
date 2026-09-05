const jwt = require('jsonwebtoken');

const logger = require('./logger');

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your-jwt-secret-here' || secret === 'your_jwt_secret_here') {
    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL SECURITY RISK: JWT_SECRET is using default placeholder in production! Set a strong JWT_SECRET immediately.');
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


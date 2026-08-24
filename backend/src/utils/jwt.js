const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || 'tiger_resume_jwt_secret_dev_key';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};

module.exports = { generateToken, verifyToken };


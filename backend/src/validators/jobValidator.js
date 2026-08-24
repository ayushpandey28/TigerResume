const { body } = require('express-validator');

const createJobRules = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').optional().trim()
];

const analyzeJobRules = [];

const generateJobRules = [
  body('jobTitle').trim().notEmpty().withMessage('Job title is required')
];

module.exports = { createJobRules, analyzeJobRules, generateJobRules };


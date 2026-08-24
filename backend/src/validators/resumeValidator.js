const { body } = require('express-validator');

const updateResumeRules = [
  body('parsedData').optional().isObject().withMessage('Parsed data must be an object')
];

module.exports = { updateResumeRules };

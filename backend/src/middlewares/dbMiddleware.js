const connectDB = require('../config/db');
const logger = require('../utils/logger');

/**
 * Middleware ensuring database connection is established before route handlers execute.
 * Critical for serverless environments (e.g. Vercel) where queries would otherwise
 * buffer and time out if incoming requests arrive before connection resolves.
 */
const dbMiddleware = async (req, res, next) => {
  // Allow health check to respond even if DB is connecting or check its status separately
  if (req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error(`Database connection unavailable for ${req.method} ${req.path}: ${err.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable. Please try again shortly.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = dbMiddleware;

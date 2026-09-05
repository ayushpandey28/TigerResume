require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Eagerly initiate database connection in background for faster serverless cold starts
if (process.env.MONGODB_URI) {
  connectDB().catch((err) => {
    logger.warn(`Initial background database connection attempt: ${err.message}`);
  });
}

// Only start standalone HTTP server when executed directly (node server.js / npm run dev / Render)
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    } catch (err) {
      logger.error('Failed to start server:', err.message);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;


const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    const errorMsg = 'MONGODB_URI environment variable is not defined. Please check your .env file.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
};

module.exports = connectDB;

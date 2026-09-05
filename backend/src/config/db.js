const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Global cache for Mongoose connection across serverless invocations (Vercel).
 * Using global object prevents connections from being re-created repeatedly
 * across function invocations within the same container.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    const errorMsg = 'MONGODB_URI environment variable is not defined. Please check your .env file.';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // 1. If connection is already established and active, return immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If a connection attempt is currently in progress, await the existing promise
  if (cached.promise && mongoose.connection.readyState === 2) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      cached.conn = null;
      throw err;
    }
  }

  // 3. If disconnected or state is inactive, initiate a new connection
  const opts = {
    bufferCommands: true, // Keep default Mongoose query buffering (never disable)
    maxPoolSize: 10, // Maintain up to 10 socket connections per container
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if MongoDB Atlas is unreachable
    socketTimeoutMS: 45000 // Close idle sockets after 45 seconds
  };

  cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
    .then((mongooseInstance) => {
      logger.info(`MongoDB connected successfully: ${mongooseInstance.connection.host}`);
      cached.conn = mongooseInstance;
      return mongooseInstance;
    })
    .catch((err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      cached.promise = null;
      cached.conn = null;
      throw err;
    });

  // Attach event listeners once to handle disconnections gracefully
  if (!global.__mongooseEventsAttached) {
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Clearing connection cache.');
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection event error: ${err.message}`);
      cached.conn = null;
      cached.promise = null;
    });

    global.__mongooseEventsAttached = true;
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;

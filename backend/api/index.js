const app = require('../src/app');
const connectDB = require('../src/config/db');

if (process.env.MONGODB_URI) {
  connectDB().catch((err) => {
    console.warn('Vercel cold-start DB connection attempt:', err.message);
  });
}

module.exports = app;

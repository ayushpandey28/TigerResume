const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { apiLimiter } = require('./middlewares/rateLimit');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const atsRoutes = require('./routes/atsRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobMatchRoutes = require('./routes/jobMatchRoutes');
const improvementRoutes = require('./routes/improvementRoutes');
const skillRoutes = require('./routes/skillRoutes');
const githubRoutes = require('./routes/githubRoutes');
const linkedinRoutes = require('./routes/linkedinRoutes');
const chatRoutes = require('./routes/chatRoutes');
const historyRoutes = require('./routes/historyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Security
app.use(helmet());

// CORS configuration (supports comma-separated list or single origin, plus dev fallbacks)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    try {
      const parsedUrl = new URL(origin);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        process.env.NODE_ENV !== 'production' ||
        /\.vercel\.app$/.test(parsedUrl.hostname)
      ) {
        return callback(null, true);
      }
    } catch (e) {
      // Invalid URL format in origin
    }
    return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
  },
  credentials: true
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'TigerResume API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-match', jobMatchRoutes);
app.use('/api/improvement', improvementRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);


// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

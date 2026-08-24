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

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

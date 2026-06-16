'use strict';

require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { rateLimiter } = require('./middleware/rateLimiter');
const logger = require('./config/logger');

// Routes
const dashboardRoutes = require('./routes/dashboard');
const apiRoutes = require('./routes/api');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;
const dataService = require('./services/dataService');

// ─── Security & Performance Middleware ────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(cors());

// ─── Request Parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
}));

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));
app.use(requestLogger);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', rateLimiter);

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ─── Template Locals ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || 'DevOps Command Center';
  res.locals.appVersion = process.env.APP_VERSION || '1.0.0';
  res.locals.nodeEnv = process.env.NODE_ENV || 'development';
  res.locals.currentPath = req.path;
  res.locals.activityList = dataService.getTeamActivity();
  res.locals.page = '';
  res.locals.activeEnv = dataService.getEnvironment();
  res.locals.services = dataService.getServices();
  res.locals.containers = dataService.getContainers();
  res.locals.incidents = dataService.getIncidents();
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/', dashboardRoutes);
app.use('/api', apiRoutes);
app.use('/health', healthRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 DevOps Command Center running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 Dashboard: http://localhost:${PORT}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;

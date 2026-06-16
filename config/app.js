'use strict';

module.exports = {
  app: {
    name: process.env.APP_NAME || 'DevOps Command Center',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'fallback-secret',
    apiKey: process.env.API_KEY || 'dev-api-key',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  deployment: {
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    deployEnv: process.env.DEPLOY_ENV || 'development',
  },
};

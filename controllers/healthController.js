'use strict';

const os = require('os');

/**
 * GET /health - Health check endpoint
 */
const healthCheck = (req, res) => {
  res.json({
    status: 'healthy',
    application: process.env.APP_NAME || 'DevOps Command Center',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /health/detailed - Detailed health endpoint
 */
const detailedHealthCheck = (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();
  const loadAvg = os.loadavg();

  res.json({
    status: 'healthy',
    application: process.env.APP_NAME || 'DevOps Command Center',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime)}s`,
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      memoryUsage: {
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      },
    },
    system: {
      platform: os.platform(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      loadAverage: loadAvg,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
    },
    checks: {
      api: 'healthy',
      memory: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'healthy' : 'warning',
      process: 'healthy',
    },
  });
};

module.exports = { healthCheck, detailedHealthCheck };

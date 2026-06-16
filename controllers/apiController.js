'use strict';

const dataService = require('../services/dataService');
const logger = require('../config/logger');
const os = require('os');

/**
 * GET /api/health - Application health check
 */
const getHealth = (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  res.json({
    status: 'healthy',
    application: process.env.APP_NAME || 'DevOps Command Center',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime),
    },
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      cpus: os.cpus().length,
      freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`,
      totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
    },
  });
};

/**
 * GET /api/services - All service health data
 */
const getServices = (req, res) => {
  try {
    const services = dataService.getServices();
    res.json({
      status: 'success',
      count: services.length,
      data: services,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getServices', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/deployments - Deployment history
 */
const getDeployments = (req, res) => {
  try {
    const deployments = dataService.getDeployments();
    res.json({
      status: 'success',
      count: deployments.length,
      data: deployments,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getDeployments', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/logs - Application logs
 */
const getLogs = (req, res) => {
  try {
    const { level, search, limit } = req.query;
    const logs = dataService.getLogs(
      parseInt(limit, 10) || 50,
      level || null,
      search || null
    );
    res.json({
      status: 'success',
      count: logs.length,
      filters: { level, search, limit },
      data: logs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getLogs', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/incidents - Incident center data
 */
const getIncidents = (req, res) => {
  try {
    const incidents = dataService.getIncidents();
    res.json({
      status: 'success',
      count: incidents.length,
      data: incidents,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getIncidents', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/containers - Container data
 */
const getContainers = (req, res) => {
  try {
    const containers = dataService.getContainers();
    res.json({
      status: 'success',
      count: containers.length,
      data: containers,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getContainers', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/metrics - System metric data for charts
 */
const getMetrics = (req, res) => {
  try {
    const metrics = dataService.getMetrics();
    res.json({
      status: 'success',
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getMetrics', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/environments - Environment data
 */
const getEnvironments = (req, res) => {
  try {
    const environments = dataService.getEnvironments();
    res.json({
      status: 'success',
      count: environments.length,
      data: environments,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getEnvironments', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/cicd - CI/CD pipeline activity
 */
const getCiCd = (req, res) => {
  try {
    const pipelines = dataService.getCiCdActivity();
    res.json({
      status: 'success',
      count: pipelines.length,
      data: pipelines,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getCiCd', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/stats - Dashboard stats (legacy alias)
 */
const getStats = (req, res) => {
  try {
    const stats = dataService.getDashboardStats();
    res.json({
      status: 'success',
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getStats', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

/**
 * GET /api/dashboard - Aggregated dashboard data
 * Returns system-wide health, deployment stats, active incidents,
 * and environment context in a single response — designed to populate
 * the overview page without multiple round-trips.
 */
const getDashboard = (req, res) => {
  try {
    const data = dataService.getDashboard();
    res.json({
      status: 'success',
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('API error - getDashboard', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Mutation Controllers ─────────────────────────────────────────────────────

const postRestartService = (req, res) => {
  try {
    const { id } = req.body;
    const success = dataService.mutateRestartService(id);
    if (success) {
      res.json({ status: 'success', message: `Service ${id} is restarting.` });
    } else {
      res.status(404).json({ status: 'error', message: `Service ${id} not found.` });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const postRestartContainer = (req, res) => {
  try {
    const { id } = req.body;
    const success = dataService.mutateRestartContainer(id);
    if (success) {
      res.json({ status: 'success', message: `Container ${id} is restarting.` });
    } else {
      res.status(404).json({ status: 'error', message: `Container ${id} not found.` });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const postStopContainer = (req, res) => {
  try {
    const { id } = req.body;
    const success = dataService.mutateStopContainer(id);
    if (success) {
      res.json({ status: 'success', message: `Container ${id} has been stopped.` });
    } else {
      res.status(404).json({ status: 'error', message: `Container ${id} not found.` });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const postTriggerDeployment = (req, res) => {
  try {
    const { branch, commitMsg } = req.body;
    const pipe = dataService.mutateTriggerDeployment(branch, commitMsg);
    res.json({ status: 'success', data: pipe });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const postIncidentStatus = (req, res) => {
  try {
    const { id, status, rootCause, notes } = req.body;
    const success = dataService.mutateIncidentStatus(id, status, rootCause, notes);
    if (success) {
      res.json({ status: 'success', message: `Incident ${id} updated to ${status}.` });
    } else {
      res.status(404).json({ status: 'error', message: `Incident ${id} not found.` });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const postSwitchEnvironment = (req, res) => {
  try {
    const { environment } = req.body;
    dataService.setEnvironment(environment);
    res.json({ status: 'success', environment: dataService.getEnvironment() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const postRefreshStats = (req, res) => {
  try {
    dataService.mutateRecalculateStats();
    res.json({ status: 'success', data: dataService.getDashboardStats() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Helper
function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = {
  getHealth,
  getServices,
  getDeployments,
  getLogs,
  getIncidents,
  getContainers,
  getMetrics,
  getEnvironments,
  getCiCd,
  getStats,
  getDashboard,

  // Mutations
  postRestartService,
  postRestartContainer,
  postStopContainer,
  postTriggerDeployment,
  postIncidentStatus,
  postSwitchEnvironment,
  postRefreshStats,
};

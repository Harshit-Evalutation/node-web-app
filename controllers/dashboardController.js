'use strict';

const dataService = require('../services/dataService');
const logger = require('../config/logger');

/**
 * Render the main dashboard overview page
 */
const getDashboard = async (req, res, next) => {
  try {
    const stats = dataService.getDashboardStats();
    const services = dataService.getServices();
    const containers = dataService.getContainers();
    const deployments = dataService.getDeployments().slice(0, 5);
    const incidents = dataService.getIncidents().slice(0, 3);
    const cicd = dataService.getCiCdActivity().slice(0, 3);
    const environments = dataService.getEnvironments();
    const dashboardMetrics = dataService.getDashboardMetrics();

    res.render('pages/dashboard', {
      title: 'Dashboard Overview | DevOps Command Center',
      page: 'dashboard',
      stats,
      services: services.slice(0, 4),
      containers: containers.slice(0, 4),
      deployments,
      incidents,
      cicd,
      environments,
      dashboardMetrics,
    });
  } catch (err) {
    logger.error('Error rendering dashboard', { error: err.message });
    next(err);
  }
};

/**
 * Render services monitoring page
 */
const getServices = async (req, res, next) => {
  try {
    const services = dataService.getServices();
    const metrics = dataService.getMetrics();

    res.render('pages/services', {
      title: 'Service Monitoring | DevOps Command Center',
      page: 'services',
      services,
      metrics,
    });
  } catch (err) {
    logger.error('Error rendering services page', { error: err.message });
    next(err);
  }
};

/**
 * Render containers page
 */
const getContainers = async (req, res, next) => {
  try {
    const containers = dataService.getContainers();
    const containerMetrics = dataService.getContainerMetrics();

    res.render('pages/containers', {
      title: 'Container Monitoring | DevOps Command Center',
      page: 'containers',
      containers,
      containerMetrics,
    });
  } catch (err) {
    logger.error('Error rendering containers page', { error: err.message });
    next(err);
  }
};

/**
 * Render deployments page
 */
const getDeployments = async (req, res, next) => {
  try {
    const deployments = dataService.getDeployments();
    const deploymentMetrics = dataService.getDeploymentMetrics();

    res.render('pages/deployments', {
      title: 'Deployment History | DevOps Command Center',
      page: 'deployments',
      deployments,
      deploymentMetrics,
    });
  } catch (err) {
    logger.error('Error rendering deployments page', { error: err.message });
    next(err);
  }
};

/**
 * Render logs viewer page
 */
const getLogs = async (req, res, next) => {
  try {
    const { level, search, limit } = req.query;
    const logs = dataService.getLogs(
      parseInt(limit, 10) || 50,
      level || null,
      search || null
    );

    res.render('pages/logs', {
      title: 'Log Viewer | DevOps Command Center',
      page: 'logs',
      logs,
      filters: { level: level || 'ALL', search: search || '', limit: limit || '50' },
    });
  } catch (err) {
    logger.error('Error rendering logs page', { error: err.message });
    next(err);
  }
};

/**
 * Render incidents page
 */
const getIncidents = async (req, res, next) => {
  try {
    const incidents = dataService.getIncidents();

    res.render('pages/incidents', {
      title: 'Incident Center | DevOps Command Center',
      page: 'incidents',
      incidents,
    });
  } catch (err) {
    logger.error('Error rendering incidents page', { error: err.message });
    next(err);
  }
};

/**
 * Render environments page
 */
const getEnvironments = async (req, res, next) => {
  try {
    const environments = dataService.getEnvironments();
    const deployments = dataService.getDeployments().slice(0, 6);

    res.render('pages/environments', {
      title: 'Environment Management | DevOps Command Center',
      page: 'environments',
      environments,
      deployments,
    });
  } catch (err) {
    logger.error('Error rendering environments page', { error: err.message });
    next(err);
  }
};

/**
 * Render CI/CD activity page
 */
const getCiCd = async (req, res, next) => {
  try {
    const pipelines = dataService.getCiCdActivity();
    const cicdMetrics = dataService.getCicdMetrics();

    res.render('pages/cicd', {
      title: 'CI/CD Activity | DevOps Command Center',
      page: 'cicd',
      pipelines,
      cicdMetrics,
    });
  } catch (err) {
    logger.error('Error rendering CI/CD page', { error: err.message });
    next(err);
  }
};

module.exports = {
  getDashboard,
  getServices,
  getContainers,
  getDeployments,
  getLogs,
  getIncidents,
  getEnvironments,
  getCiCd,
};

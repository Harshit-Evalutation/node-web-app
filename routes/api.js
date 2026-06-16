'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiController');

// ─── Health & Stats ────────────────────────────────────────────────────────────
router.get('/health',       controller.getHealth);
router.get('/stats',        controller.getStats);
router.get('/dashboard',    controller.getDashboard);

// ─── Core Data Endpoints ───────────────────────────────────────────────────────
router.get('/services',     controller.getServices);
router.get('/containers',   controller.getContainers);
router.get('/deployments',  controller.getDeployments);
router.get('/logs',         controller.getLogs);
router.get('/incidents',    controller.getIncidents);
router.get('/metrics',      controller.getMetrics);
router.get('/environments', controller.getEnvironments);
router.get('/cicd',         controller.getCiCd);
router.get('/pipelines',    controller.getCiCd); // semantic alias

// ─── Mutations ─────────────────────────────────────────────────────────────────
router.post('/services/restart',     controller.postRestartService);
router.post('/containers/restart',   controller.postRestartContainer);
router.post('/containers/stop',      controller.postStopContainer);
router.post('/deployments/trigger',  controller.postTriggerDeployment);
router.post('/incidents/status',     controller.postIncidentStatus);
router.post('/environments/switch',  controller.postSwitchEnvironment);
router.post('/stats/refresh',        controller.postRefreshStats);

module.exports = router;

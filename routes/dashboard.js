'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardController');

router.get('/', controller.getDashboard);
router.get('/services', controller.getServices);
router.get('/containers', controller.getContainers);
router.get('/deployments', controller.getDeployments);
router.get('/logs', controller.getLogs);
router.get('/incidents', controller.getIncidents);
router.get('/environments', controller.getEnvironments);
router.get('/cicd', controller.getCiCd);

module.exports = router;

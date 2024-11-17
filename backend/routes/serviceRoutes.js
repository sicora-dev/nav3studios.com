const express = require('express');
const serviceController = require('../controllers/serviceController');
const router = express.Router();

router.get('/services', serviceController.getServices);
router.get('/services/:serviceId/price', serviceController.getServicePrice);
router.get('/services/:serviceId/name', serviceController.getServiceName);

module.exports = router;
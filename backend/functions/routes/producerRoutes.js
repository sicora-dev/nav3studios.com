const express = require('express');
const producerController = require('../controllers/producerController');
const router = express.Router();

router.get('/producers', producerController.getProducers);
router.get('/producer/:id', producerController.getProducerById);

module.exports = router;
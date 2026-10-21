const express = require('express');
const router = express.Router();
const { handleGatewayRequest } = require('../controllers/gatewayController');

// Handles any HTTP method sent to the gateway
router.all('/execute/:apiId', handleGatewayRequest);
router.all('/call/:apiId', handleGatewayRequest);

module.exports = router;

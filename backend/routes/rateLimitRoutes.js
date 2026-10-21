const express = require('express');
const router = express.Router();
const {
  getRateLimits,
  updateRateLimit,
} = require('../controllers/rateLimitController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);
router.use(requireRole('admin'));

router.get('/', getRateLimits);
router.put('/:apiId', updateRateLimit);

module.exports = router;

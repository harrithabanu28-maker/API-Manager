const express = require('express');
const router = express.Router();
const {
  getApis,
  getApiById,
  createApi,
  updateApi,
  toggleApiStatus,
  checkHealth,
  deleteApi,
} = require('../controllers/apiController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/', getApis);
router.get('/:id', getApiById);
router.post('/', requireRole('admin'), createApi);
router.put('/:id', requireRole('admin'), updateApi);
router.patch('/:id/status', requireRole('admin'), toggleApiStatus);
router.post('/:id/health-check', requireRole('admin'), checkHealth);
router.delete('/:id', requireRole('admin'), deleteApi);

module.exports = router;

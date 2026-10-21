const express = require('express');
const router = express.Router();
const {
  getApiKeys,
  issueApiKey,
  toggleKeyStatus,
  revokeApiKey,
} = require('../controllers/apiKeyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getApiKeys);
router.post('/', issueApiKey);
router.patch('/:id/status', toggleKeyStatus);
router.delete('/:id', revokeApiKey);

module.exports = router;

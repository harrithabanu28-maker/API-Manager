const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', requireRole('admin'), deleteNotification);

module.exports = router;

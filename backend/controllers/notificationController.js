const Notification = require('../models/Notification');

// @desc    Get system notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({ read: false });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ message: 'Failed to retrieve notifications' });
  }
};

// @desc    Mark a notification or all as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany({ read: false }, { read: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notification' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin only)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.deleteMany({});
      return res.status(200).json({ success: true, message: 'All notifications cleared' });
    }

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
};

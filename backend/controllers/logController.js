const RequestLog = require('../models/RequestLog');

// @desc    Get request logs (Admin sees all, Developer sees their own)
// @route   GET /api/logs
// @access  Private
exports.getLogs = async (req, res) => {
  try {
    const { apiId, method, result, search, limit = 50, page = 1 } = req.query;

    const query = {};

    // Developer privacy: developers only see their own logs
    if (req.user.role === 'developer') {
      query.user = req.user.id;
    }

    if (apiId && apiId !== 'all') {
      query.api = apiId;
    }

    if (method && method !== 'all') {
      query.method = method.toUpperCase();
    }

    if (result && result !== 'all') {
      query.result = result;
    }

    if (search) {
      query.$or = [
        { apiName: { $regex: search, $options: 'i' } },
        { endpoint: { $regex: search, $options: 'i' } },
        { errorMessage: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = Math.min(Number(limit) || 50, 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const skip = (currentPage - 1) * pageSize;

    const [logs, total] = await Promise.all([
      RequestLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('api', 'name slug')
        .populate('user', 'name email'),
      RequestLog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize) || 1,
      logs,
    });
  } catch (error) {
    console.error('getLogs error:', error);
    return res.status(500).json({ message: 'Failed to retrieve logs' });
  }
};

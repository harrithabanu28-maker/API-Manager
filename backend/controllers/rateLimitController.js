const Api = require('../models/Api');
const RequestLog = require('../models/RequestLog');
const Notification = require('../models/Notification');

// @desc    Get all rate limits and current usage metrics
// @route   GET /api/rate-limits
// @access  Private (Admin only)
exports.getRateLimits = async (req, res) => {
  try {
    const apis = await Api.find().sort({ name: 1 });

    const now = new Date();

    const rateLimitData = await Promise.all(
      apis.map(async (api) => {
        // Calculate requests in the active window (e.g. last 60 seconds or last hour depending on window)
        const windowDurationMs = (api.rateLimitWindow || 60) * 1000;
        const windowStart = new Date(now.getTime() - windowDurationMs);

        const currentRequests = await RequestLog.countDocuments({
          api: api._id,
          createdAt: { $gte: windowStart },
        });

        const limit = api.rateLimit || 60;
        const usagePercentage = Math.min(
          100,
          Math.round((currentRequests / limit) * 100)
        );

        let status = 'normal'; // 'normal' | 'approaching' | 'exceeded'
        if (usagePercentage >= 100) {
          status = 'exceeded';
        } else if (usagePercentage >= 80) {
          status = 'approaching';
        }

        return {
          apiId: api._id,
          apiName: api.name,
          endpoint: api.endpoint,
          method: api.method,
          rateLimit: limit,
          rateLimitWindow: api.rateLimitWindow || 60,
          currentUsage: currentRequests,
          usagePercentage,
          status,
          apiStatus: api.status,
          totalRateLimitedRequests: api.rateLimitedRequests || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      rateLimits: rateLimitData,
    });
  } catch (error) {
    console.error('getRateLimits error:', error);
    return res.status(500).json({ message: 'Failed to retrieve rate limits' });
  }
};

// @desc    Update rate limit for an API
// @route   PUT /api/rate-limits/:apiId
// @access  Private (Admin only)
exports.updateRateLimit = async (req, res) => {
  try {
    const { rateLimit, rateLimitWindow } = req.body;

    if (!rateLimit || Number(rateLimit) < 1) {
      return res.status(400).json({ message: 'Rate limit must be at least 1 request' });
    }

    const api = await Api.findById(req.params.apiId);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    const oldLimit = api.rateLimit;
    api.rateLimit = Number(rateLimit);
    if (rateLimitWindow) {
      api.rateLimitWindow = Number(rateLimitWindow);
    }
    await api.save();

    await Notification.create({
      title: 'Rate Limit Updated',
      message: `Rate limit for "${api.name}" updated from ${oldLimit} to ${api.rateLimit} req/${api.rateLimitWindow || 60}s.`,
      type: 'info',
      api: api._id,
      apiName: api.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Rate limit updated successfully',
      api,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update rate limit' });
  }
};

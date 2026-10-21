const RequestLog = require('../models/RequestLog');
const Api = require('../models/Api');
const ApiKey = require('../models/ApiKey');

// @desc    Get dashboard metrics and graph data
// @route   GET /api/analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const isDeveloper = req.user.role === 'developer';
    const logFilter = isDeveloper ? { user: req.user.id } : {};

    // 1. Overall stats counts
    const [totalRequests, successfulRequests, failedRequests, rateLimitedRequests] =
      await Promise.all([
        RequestLog.countDocuments(logFilter),
        RequestLog.countDocuments({ ...logFilter, result: 'successful' }),
        RequestLog.countDocuments({ ...logFilter, result: 'failed' }),
        RequestLog.countDocuments({ ...logFilter, result: 'rate_limited' }),
      ]);

    // Average Response Time
    const avgResponseTimeAgg = await RequestLog.aggregate([
      { $match: logFilter },
      { $group: { _id: null, avgTime: { $avg: '$responseTime' } } },
    ]);
    const avgResponseTime =
      avgResponseTimeAgg.length > 0
        ? Math.round(avgResponseTimeAgg[0].avgTime)
        : 0;

    // Additional summary counts
    const activeApisCount = await Api.countDocuments({ status: 'active' });
    const activeKeysCount = await ApiKey.countDocuments(
      isDeveloper ? { user: req.user.id, status: 'active' } : { status: 'active' }
    );

    // 2. Graph 1: API Requests — Last 7 Days (Actual daily request counts)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRequestsAgg = await RequestLog.aggregate([
      {
        $match: {
          ...logFilter,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$result', 'successful'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$result', 'failed'] }, 1, 0] },
          },
          rateLimited: {
            $sum: { $cond: [{ $eq: ['$result', 'rate_limited'] }, 1, 0] },
          },
        },
      },
    ]);

    // Format all 7 days with nice day names
    const daysMap = {};
    dailyRequestsAgg.forEach((item) => {
      daysMap[item._id] = item;
    });

    const requestsLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayData = daysMap[dateStr] || {
        count: 0,
        successful: 0,
        failed: 0,
        rateLimited: 0,
      };

      requestsLast7Days.push({
        day: dayName,
        date: dateStr,
        requests: dayData.count,
        successful: dayData.successful,
        failed: dayData.failed,
        rateLimited: dayData.rateLimited,
      });
    }

    // 3. Graph 2: Request Status Distribution (Pie / Bar)
    const requestStatusDistribution = [
      { name: 'Successful', value: successfulRequests, color: '#10b981' },
      { name: 'Failed', value: failedRequests, color: '#ef4444' },
      { name: 'Rate-Limited', value: rateLimitedRequests, color: '#f59e0b' },
    ];

    // 4. Graph 3: Average Response Time over time (recent trend samples)
    const responseTimeTrend = await RequestLog.aggregate([
      { $match: logFilter },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 1,
          time: {
            $dateToString: { format: '%H:%M:%S', date: '$createdAt' },
          },
          responseTime: 1,
          apiName: 1,
          result: 1,
        },
      },
    ]);
    responseTimeTrend.reverse(); // Chronological order

    return res.status(200).json({
      success: true,
      summary: {
        totalRequests,
        successfulRequests,
        failedRequests,
        rateLimitedRequests,
        avgResponseTime,
        activeApis: activeApisCount,
        activeKeys: activeKeysCount,
      },
      graphs: {
        requestsLast7Days,
        requestStatusDistribution,
        responseTimeTrend,
      },
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    return res.status(500).json({ message: 'Failed to retrieve analytics' });
  }
};

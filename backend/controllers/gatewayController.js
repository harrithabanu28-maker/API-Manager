const Api = require('../models/Api');
const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');
const Notification = require('../models/Notification');
const { hashApiKey } = require('../utils/keyGenerator');
const axios = require('axios');

// Helper to calculate health status based on metrics
const evaluateHealth = (api, responseTime, isSuccess) => {
  if (api.status === 'inactive') {
    return { status: 'critical', message: 'API is disabled/inactive' };
  }

  // Response time check
  if (responseTime > 1800) {
    return {
      status: 'warning',
      message: `High latency detected: ${responseTime}ms`,
    };
  }

  // Failure checks
  const total = (api.totalRequests || 0) + 1;
  const failed = (api.failedRequests || 0) + (isSuccess ? 0 : 1);
  const failureRatio = failed / total;

  if (failureRatio > 0.4 && total >= 3) {
    return {
      status: 'critical',
      message: `Critical failure rate (${Math.round(failureRatio * 100)}%)`,
    };
  }

  if (failureRatio > 0.2 && total >= 3) {
    return {
      status: 'warning',
      message: `Elevated error rate (${Math.round(failureRatio * 100)}%)`,
    };
  }

  return { status: 'healthy', message: 'Operational with normal latency' };
};

// @desc    Gateway Request Handler (Live API gateway + Tester execution)
// @route   ALL /api/gateway/execute/:apiId
// @access  Public (Requires API Key via header x-api-key)
exports.handleGatewayRequest = async (req, res) => {
  const startTime = Date.now();
  const rawKey = req.headers['x-api-key'] || req.query.apiKey;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  let api = null;
  let apiKeyRecord = null;
  let matchedUser = null;

  try {
    // 1. Locate Target API
    const { apiId } = req.params;
    api = await Api.findById(apiId);
    if (!api) {
      // Fallback by slug
      api = await Api.findOne({ slug: apiId });
    }

    if (!api) {
      return res.status(404).json({
        error: 'API Not Found',
        message: 'The requested API endpoint is not registered in API Manager',
      });
    }

    // 2. Validate API Key
    if (!rawKey) {
      const responseTime = Date.now() - startTime;
      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 401,
        responseTime,
        result: 'failed',
        errorMessage: 'Missing API Key in x-api-key header',
        ip: clientIp,
      });

      api.totalRequests += 1;
      api.failedRequests += 1;
      await api.save();

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing required API key. Please supply a valid key via the "x-api-key" header.',
      });
    }

    const keyHash = hashApiKey(rawKey);
    apiKeyRecord = await ApiKey.findOne({ keyHash }).populate('user');

    if (!apiKeyRecord) {
      const responseTime = Date.now() - startTime;
      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 401,
        responseTime,
        result: 'failed',
        errorMessage: 'Invalid API Key',
        ip: clientIp,
      });

      api.totalRequests += 1;
      api.failedRequests += 1;
      await api.save();

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid API Key provided',
      });
    }

    matchedUser = apiKeyRecord.user;

    if (apiKeyRecord.status !== 'active') {
      const responseTime = Date.now() - startTime;
      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        user: matchedUser?._id,
        userName: matchedUser?.name,
        apiKey: apiKeyRecord._id,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 403,
        responseTime,
        result: 'failed',
        errorMessage: `API key is ${apiKeyRecord.status}`,
        ip: clientIp,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: `This API key is currently ${apiKeyRecord.status}`,
      });
    }

    // Ensure key is assigned to this API
    if (apiKeyRecord.api.toString() !== api._id.toString()) {
      const responseTime = Date.now() - startTime;
      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        user: matchedUser?._id,
        userName: matchedUser?.name,
        apiKey: apiKeyRecord._id,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 403,
        responseTime,
        result: 'failed',
        errorMessage: 'API Key not authorized for this specific API',
        ip: clientIp,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'This API key is not authorized for the requested API',
      });
    }

    // 3. Verify API is Active
    if (api.status !== 'active') {
      const responseTime = Date.now() - startTime;
      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        user: matchedUser?._id,
        userName: matchedUser?.name,
        apiKey: apiKeyRecord._id,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 503,
        responseTime,
        result: 'failed',
        errorMessage: 'API is disabled/inactive',
        ip: clientIp,
      });

      api.totalRequests += 1;
      api.failedRequests += 1;
      api.healthStatus = 'critical';
      api.healthMessage = 'API is disabled by administrator';
      await api.save();

      return res.status(503).json({
        error: 'Service Unavailable',
        message: `API "${api.name}" is currently disabled by administrator`,
      });
    }

    // 4. Rate Limiting Check (Sliding Window)
    const windowSeconds = api.rateLimitWindow || 60;
    const windowStart = new Date(Date.now() - windowSeconds * 1000);

    const windowRequestsCount = await RequestLog.countDocuments({
      api: api._id,
      createdAt: { $gte: windowStart },
    });

    const configuredLimit = api.rateLimit || 60;

    // Check if limit exceeded
    if (windowRequestsCount >= configuredLimit) {
      const responseTime = Date.now() - startTime;

      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        user: matchedUser?._id,
        userName: matchedUser?.name,
        apiKey: apiKeyRecord._id,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 429,
        responseTime,
        result: 'rate_limited',
        errorMessage: `Rate limit of ${configuredLimit} req/${windowSeconds}s exceeded`,
        ip: clientIp,
      });

      api.totalRequests += 1;
      api.rateLimitedRequests += 1;
      await api.save();

      // Create notification for limit exceeded
      await Notification.create({
        title: 'Rate Limit Exceeded',
        message: `API "${api.name}" exceeded its allowed rate limit (${configuredLimit} requests per ${windowSeconds}s). HTTP 429 returned.`,
        type: 'critical',
        api: api._id,
        apiName: api.name,
      });

      res.setHeader('Retry-After', windowSeconds);
      res.setHeader('X-RateLimit-Limit', configuredLimit);
      res.setHeader('X-RateLimit-Remaining', 0);

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit of ${configuredLimit} requests per ${windowSeconds}s has been reached for "${api.name}". Please wait before retrying.`,
        limit: configuredLimit,
        windowSeconds,
      });
    }

    // Check if approaching limit (80%)
    if (windowRequestsCount + 1 >= Math.floor(configuredLimit * 0.8)) {
      // Check if alert notification already sent in this window
      const recentNotification = await Notification.findOne({
        api: api._id,
        title: 'Rate Limit Warning',
        createdAt: { $gte: windowStart },
      });

      if (!recentNotification) {
        await Notification.create({
          title: 'Rate Limit Warning',
          message: `API "${api.name}" is approaching its rate limit (${windowRequestsCount + 1}/${configuredLimit} requests used).`,
          type: 'warning',
          api: api._id,
          apiName: api.name,
        });
      }
    }

    // 5. Execute Request: Proxy to Target or Serve Built-in Service
    let statusCode = 200;
    let responseData = null;
    let isSuccess = true;

    if (api.targetUrl && api.targetUrl.startsWith('http')) {
      try {
        const proxyResp = await axios({
          method: req.method,
          url: api.targetUrl,
          headers: {
            ...req.headers,
            host: undefined,
            'x-api-key': undefined,
          },
          params: req.query,
          data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
          timeout: 8000,
          validateStatus: () => true, // capture all status codes
        });

        statusCode = proxyResp.status;
        responseData = proxyResp.data;
        isSuccess = statusCode < 400;
      } catch (proxyError) {
        statusCode = 502;
        responseData = {
          error: 'Bad Gateway',
          message: `Failed to connect to target URL: ${proxyError.message}`,
        };
        isSuccess = false;
      }
    } else {
      // Internal Mock Response / Dynamic Service
      statusCode = 200;
      if (api.mockResponse && typeof api.mockResponse === 'object') {
        responseData = api.mockResponse;
      } else {
        responseData = {
          status: 'success',
          api: api.name,
          endpoint: api.endpoint,
          method: req.method,
          message: `Request successfully processed by API Manager`,
          queryReceived: req.query,
          bodyReceived: req.body,
          timestamp: new Date().toISOString(),
        };
      }
    }

    const responseTime = Date.now() - startTime;
    const result = isSuccess ? 'successful' : 'failed';

    // 6. Record Request Log
    await RequestLog.create({
      api: api._id,
      apiName: api.name,
      user: matchedUser?._id,
      userName: matchedUser?.name,
      apiKey: apiKeyRecord._id,
      method: req.method,
      endpoint: api.endpoint,
      statusCode,
      responseTime,
      result,
      errorMessage: isSuccess ? '' : `HTTP ${statusCode}`,
      ip: clientIp,
    });

    // 7. Update API Metrics & Health
    api.totalRequests = (api.totalRequests || 0) + 1;
    if (isSuccess) {
      api.successfulRequests = (api.successfulRequests || 0) + 1;
    } else {
      api.failedRequests = (api.failedRequests || 0) + 1;
    }

    const prevAvg = api.avgResponseTime || 0;
    api.avgResponseTime = Math.round(
      (prevAvg * (api.totalRequests - 1) + responseTime) / api.totalRequests
    );

    const healthEval = evaluateHealth(api, responseTime, isSuccess);
    api.healthStatus = healthEval.status;
    api.healthMessage = healthEval.message;
    api.lastHealthCheck = new Date();
    await api.save();

    // 8. Update API Key usage stats
    apiKeyRecord.requestCount = (apiKeyRecord.requestCount || 0) + 1;
    apiKeyRecord.lastUsed = new Date();
    await apiKeyRecord.save();

    // 9. Alert if high latency or request failed
    if (responseTime > 1500) {
      await Notification.create({
        title: 'High Response Time',
        message: `High latency of ${responseTime}ms on API "${api.name}".`,
        type: 'warning',
        api: api._id,
        apiName: api.name,
      });
    }

    if (!isSuccess && statusCode >= 500) {
      await Notification.create({
        title: 'API Request Failure',
        message: `Request to "${api.name}" failed with HTTP status ${statusCode}.`,
        type: 'critical',
        api: api._id,
        apiName: api.name,
      });
    }

    // Set custom gateway headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-RateLimit-Limit', configuredLimit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, configuredLimit - (windowRequestsCount + 1)));

    return res.status(statusCode).json(responseData);
  } catch (error) {
    console.error('handleGatewayRequest error:', error);
    const responseTime = Date.now() - startTime;

    if (api) {
      api.totalRequests = (api.totalRequests || 0) + 1;
      api.failedRequests = (api.failedRequests || 0) + 1;
      api.healthStatus = 'critical';
      api.healthMessage = 'Gateway error during processing';
      await api.save();

      await RequestLog.create({
        api: api._id,
        apiName: api.name,
        user: matchedUser?._id,
        userName: matchedUser?.name,
        apiKey: apiKeyRecord?._id,
        method: req.method,
        endpoint: api.endpoint,
        statusCode: 500,
        responseTime,
        result: 'failed',
        errorMessage: error.message,
        ip: clientIp,
      });
    }

    return res.status(500).json({
      error: 'Internal Gateway Error',
      message: error.message || 'An error occurred while executing the API request',
    });
  }
};

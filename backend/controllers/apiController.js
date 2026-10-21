const Api = require('../models/Api');
const ApiKey = require('../models/ApiKey');
const Notification = require('../models/Notification');
const RequestLog = require('../models/RequestLog');
const axios = require('axios');

// Helper to generate unique slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all APIs (Admin sees all, Developer sees only active)
// @route   GET /api/apis
// @access  Private
exports.getApis = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'developer') {
      filter.status = 'active';
    }

    const apis = await Api.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      count: apis.length,
      apis,
    });
  } catch (error) {
    console.error('getApis error:', error);
    return res.status(500).json({ message: 'Failed to retrieve APIs' });
  }
};

// @desc    Get single API
// @route   GET /api/apis/:id
// @access  Private
exports.getApiById = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    if (req.user.role === 'developer' && api.status !== 'active') {
      return res.status(403).json({ message: 'API is not currently available' });
    }

    return res.status(200).json({ success: true, api });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register new API
// @route   POST /api/apis
// @access  Private (Admin only)
exports.createApi = async (req, res) => {
  try {
    const {
      name,
      endpoint,
      method = 'GET',
      description = '',
      rateLimit = 60,
      rateLimitWindow = 60,
      targetUrl = '',
      mockResponse = null,
    } = req.body;

    if (!name || !endpoint) {
      return res.status(400).json({ message: 'Please provide API name and endpoint' });
    }

    // Validate endpoint format
    let cleanEndpoint = endpoint.trim();
    if (!cleanEndpoint.startsWith('/')) {
      cleanEndpoint = '/' + cleanEndpoint;
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await Api.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newApi = await Api.create({
      name: name.trim(),
      slug,
      endpoint: cleanEndpoint,
      method: method.toUpperCase(),
      description: description.trim(),
      rateLimit: Number(rateLimit) || 60,
      rateLimitWindow: Number(rateLimitWindow) || 60,
      targetUrl: targetUrl ? targetUrl.trim() : '',
      mockResponse: mockResponse || {
        status: 'success',
        message: `Response from ${name.trim()}`,
        timestamp: new Date().toISOString(),
      },
      createdBy: req.user.id,
      healthStatus: 'healthy',
      healthMessage: 'Operational with normal latency',
    });

    // Create system notification
    await Notification.create({
      title: 'New API Registered',
      message: `API "${newApi.name}" was successfully registered with rate limit of ${newApi.rateLimit} req/min.`,
      type: 'info',
      api: newApi._id,
      apiName: newApi.name,
    });

    return res.status(201).json({
      success: true,
      message: 'API registered successfully',
      api: newApi,
    });
  } catch (error) {
    console.error('createApi error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create API' });
  }
};

// @desc    Update API details
// @route   PUT /api/apis/:id
// @access  Private (Admin only)
exports.updateApi = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    const {
      name,
      endpoint,
      method,
      description,
      rateLimit,
      rateLimitWindow,
      targetUrl,
      mockResponse,
    } = req.body;

    if (name) api.name = name.trim();
    if (endpoint) {
      let cleanEndpoint = endpoint.trim();
      if (!cleanEndpoint.startsWith('/')) cleanEndpoint = '/' + cleanEndpoint;
      api.endpoint = cleanEndpoint;
    }
    if (method) api.method = method.toUpperCase();
    if (description !== undefined) api.description = description.trim();
    if (rateLimit !== undefined) api.rateLimit = Number(rateLimit);
    if (rateLimitWindow !== undefined) api.rateLimitWindow = Number(rateLimitWindow);
    if (targetUrl !== undefined) api.targetUrl = targetUrl.trim();
    if (mockResponse !== undefined) api.mockResponse = mockResponse;

    await api.save();

    return res.status(200).json({
      success: true,
      message: 'API updated successfully',
      api,
    });
  } catch (error) {
    console.error('updateApi error:', error);
    return res.status(500).json({ message: 'Failed to update API' });
  }
};

// @desc    Toggle API active/inactive status
// @route   PATCH /api/apis/:id/status
// @access  Private (Admin only)
exports.toggleApiStatus = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    api.status = api.status === 'active' ? 'inactive' : 'active';
    await api.save();

    await Notification.create({
      title: `API ${api.status === 'active' ? 'Enabled' : 'Disabled'}`,
      message: `API "${api.name}" is now ${api.status}.`,
      type: api.status === 'active' ? 'info' : 'warning',
      api: api._id,
      apiName: api.name,
    });

    return res.status(200).json({
      success: true,
      message: `API marked as ${api.status}`,
      api,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to change status' });
  }
};

// @desc    Run Health Check on API
// @route   POST /api/apis/:id/health-check
// @access  Private (Admin only)
exports.checkHealth = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    const startTime = Date.now();
    let health = 'healthy';
    let message = 'Operational with normal latency';
    let responseTime = 0;

    if (api.status === 'inactive') {
      health = 'critical';
      message = 'API is disabled/inactive';
    } else if (api.targetUrl) {
      try {
        const resp = await axios.get(api.targetUrl, {
          timeout: 4000,
          validateStatus: () => true, // accept any status code without throwing
        });
        responseTime = Date.now() - startTime;
        if (resp.status >= 500) {
          health = 'critical';
          message = `Target returned server error (HTTP ${resp.status})`;
        } else if (resp.status >= 400) {
          health = 'warning';
          message = `Target returned client error (HTTP ${resp.status})`;
        } else if (responseTime > 1200) {
          health = 'warning';
          message = `High latency detected: ${responseTime}ms`;
        } else {
          health = 'healthy';
          message = `Healthy - Latency: ${responseTime}ms`;
        }
      } catch (err) {
        responseTime = Date.now() - startTime;
        health = 'critical';
        message = `Endpoint unreachable: ${err.message}`;
      }
    } else {
      // Internal simulated/mock endpoint
      responseTime = Math.floor(Math.random() * 40) + 15;
      health = 'healthy';
      message = `Internal gateway operational - Latency: ${responseTime}ms`;
    }

    api.healthStatus = health;
    api.healthMessage = message;
    api.lastHealthCheck = new Date();
    await api.save();

    if (health === 'critical' || health === 'warning') {
      await Notification.create({
        title: `API Health Alert: ${api.name}`,
        message: `${message} (Status: ${health.toUpperCase()})`,
        type: health === 'critical' ? 'critical' : 'warning',
        api: api._id,
        apiName: api.name,
      });
    }

    return res.status(200).json({
      success: true,
      healthStatus: health,
      healthMessage: message,
      responseTime,
      api,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Health check failed' });
  }
};

// @desc    Delete API
// @route   DELETE /api/apis/:id
// @access  Private (Admin only)
exports.deleteApi = async (req, res) => {
  try {
    const api = await Api.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    // Revoke all associated keys
    await ApiKey.updateMany({ api: api._id }, { status: 'revoked' });

    await Api.findByIdAndDelete(req.params.id);

    await Notification.create({
      title: 'API Deleted',
      message: `API "${api.name}" was removed and its API keys revoked.`,
      type: 'warning',
      apiName: api.name,
    });

    return res.status(200).json({ success: true, message: 'API deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete API' });
  }
};

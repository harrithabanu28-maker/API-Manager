const ApiKey = require('../models/ApiKey');
const Api = require('../models/Api');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateApiKey } = require('../utils/keyGenerator');

// @desc    Get API keys (Admin gets all, Developer gets only their own)
// @route   GET /api/keys
// @access  Private
exports.getApiKeys = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'developer') {
      filter.user = req.user.id;
    }

    const keys = await ApiKey.find(filter)
      .populate('api', 'name endpoint status')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    // Format keys to only return masked values
    const formattedKeys = keys.map((k) => ({
      _id: k._id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      maskedKey: `${k.keyPrefix}`,
      status: k.status,
      api: k.api,
      user: k.user,
      lastUsed: k.lastUsed,
      requestCount: k.requestCount,
      createdAt: k.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedKeys.length,
      keys: formattedKeys,
    });
  } catch (error) {
    console.error('getApiKeys error:', error);
    return res.status(500).json({ message: 'Failed to retrieve API keys' });
  }
};

// @desc    Issue a new API key
// @route   POST /api/keys
// @access  Private
exports.issueApiKey = async (req, res) => {
  try {
    const { name, apiId, userId } = req.body;

    if (!name || !apiId) {
      return res.status(400).json({ message: 'Please provide key name and target API' });
    }

    const api = await Api.findById(apiId);
    if (!api) {
      return res.status(404).json({ message: 'API not found' });
    }

    // Determine target user
    let targetUserId = req.user.id;
    if (req.user.role === 'admin' && userId) {
      targetUserId = userId;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Generate cryptographic key
    const { secretKey, keyHash, keyPrefix } = generateApiKey();

    const newKey = await ApiKey.create({
      name: name.trim(),
      keyPrefix,
      keyHash,
      user: targetUserId,
      api: api._id,
      status: 'active',
    });

    // Notify about key issuance
    await Notification.create({
      title: 'API Key Issued',
      message: `API Key "${newKey.name}" was issued for API "${api.name}" by ${req.user.name}.`,
      type: 'info',
      api: api._id,
      apiName: api.name,
    });

    return res.status(201).json({
      success: true,
      message: 'API key issued successfully. Copy this secret key now as it cannot be retrieved again in plain text.',
      key: {
        _id: newKey._id,
        name: newKey.name,
        secretKey, // Returned ONCE upon issuance
        keyPrefix: newKey.keyPrefix,
        maskedKey: newKey.keyPrefix,
        status: newKey.status,
        api: {
          _id: api._id,
          name: api.name,
          endpoint: api.endpoint,
        },
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
        createdAt: newKey.createdAt,
      },
    });
  } catch (error) {
    console.error('issueApiKey error:', error);
    return res.status(500).json({ message: 'Failed to issue API key' });
  }
};

// @desc    Toggle key status (active / inactive)
// @route   PATCH /api/keys/:id/status
// @access  Private
exports.toggleKeyStatus = async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Check ownership
    if (req.user.role === 'developer' && key.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this key' });
    }

    if (key.status === 'revoked') {
      return res.status(400).json({ message: 'Revoked keys cannot be reactivated' });
    }

    key.status = key.status === 'active' ? 'inactive' : 'active';
    await key.save();

    return res.status(200).json({
      success: true,
      message: `API Key status changed to ${key.status}`,
      key,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update key status' });
  }
};

// @desc    Revoke an API key
// @route   DELETE /api/keys/:id
// @access  Private
exports.revokeApiKey = async (req, res) => {
  try {
    const key = await ApiKey.findById(req.params.id).populate('api');
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }

    if (req.user.role === 'developer' && key.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to revoke this key' });
    }

    key.status = 'revoked';
    await key.save();

    await Notification.create({
      title: 'API Key Revoked',
      message: `API Key "${key.name}" for API "${key.api?.name || 'Unknown'}" has been revoked.`,
      type: 'warning',
      api: key.api?._id,
      apiName: key.api?.name || '',
    });

    return res.status(200).json({
      success: true,
      message: 'API Key has been permanently revoked',
      key,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to revoke API key' });
  }
};

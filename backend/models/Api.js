const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'API Name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint path is required'],
      trim: true,
    },
    targetUrl: {
      type: String,
      default: '',
      trim: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: 'GET',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    rateLimit: {
      type: Number,
      default: 60, // allowed requests per window
      min: [1, 'Rate limit must be at least 1 request'],
    },
    rateLimitWindow: {
      type: Number,
      default: 60, // window in seconds
      min: [5, 'Window must be at least 5 seconds'],
    },
    currentUsage: {
      type: Number,
      default: 0,
    },
    healthStatus: {
      type: String,
      enum: ['healthy', 'warning', 'critical'],
      default: 'healthy',
    },
    healthMessage: {
      type: String,
      default: 'System operational with normal latency',
    },
    lastHealthCheck: {
      type: Date,
      default: Date.now,
    },
    avgResponseTime: {
      type: Number,
      default: 0,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    successfulRequests: {
      type: Number,
      default: 0,
    },
    failedRequests: {
      type: Number,
      default: 0,
    },
    rateLimitedRequests: {
      type: Number,
      default: 0,
    },
    mockResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Api', apiSchema);

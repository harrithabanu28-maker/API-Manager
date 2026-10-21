const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema(
  {
    api: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Api',
      required: true,
    },
    apiName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'Unknown User',
    },
    apiKey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApiKey',
      default: null,
    },
    method: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number,
      required: true, // in milliseconds
    },
    result: {
      type: String,
      enum: ['successful', 'failed', 'rate_limited'],
      required: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast analytics queries
requestLogSchema.index({ createdAt: -1 });
requestLogSchema.index({ api: 1, createdAt: -1 });
requestLogSchema.index({ user: 1, createdAt: -1 });
requestLogSchema.index({ result: 1 });

module.exports = mongoose.model('RequestLog', requestLogSchema);

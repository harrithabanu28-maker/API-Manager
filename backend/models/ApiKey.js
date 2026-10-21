const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Key name is required'],
      trim: true,
    },
    keyPrefix: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    api: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Api',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'revoked'],
      default: 'active',
    },
    lastUsed: {
      type: Date,
      default: null,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);

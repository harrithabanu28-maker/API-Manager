const crypto = require('crypto');

/**
 * Generate a new API key and its hash
 * Format: apm_live_<32 hex chars>
 */
const generateApiKey = () => {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const secretKey = `apm_live_${randomBytes}`;
  const keyHash = hashApiKey(secretKey);
  const keyPrefix = `${secretKey.slice(0, 9)}...${secretKey.slice(-4)}`;

  return {
    secretKey,
    keyHash,
    keyPrefix,
  };
};

/**
 * Hash an API key with SHA-256 for secure storage & lookup
 */
const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key.trim()).digest('hex');
};

module.exports = {
  generateApiKey,
  hashApiKey,
};

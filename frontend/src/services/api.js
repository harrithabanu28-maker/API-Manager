// Central API Service Client

const BASE_URL = '/api';

const getHeaders = (hasKey = false, apiKey = '') => {
  const token = localStorage.getItem('apm_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (hasKey && apiKey) {
    headers['x-api-key'] = apiKey;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (data && data.message) || (data && data.error) || response.statusText || 'Request failed';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export const apiService = {
  // Auth
  async login(email, password, portalRole) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portalRole }),
    });
    return handleResponse(res);
  },

  async register(name, email, password, role) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // APIs
  async getApis() {
    const res = await fetch(`${BASE_URL}/apis`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getApiById(id) {
    const res = await fetch(`${BASE_URL}/apis/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createApi(apiData) {
    const res = await fetch(`${BASE_URL}/apis`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(apiData),
    });
    return handleResponse(res);
  },

  async updateApi(id, apiData) {
    const res = await fetch(`${BASE_URL}/apis/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(apiData),
    });
    return handleResponse(res);
  },

  async toggleApiStatus(id) {
    const res = await fetch(`${BASE_URL}/apis/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async checkHealth(id) {
    const res = await fetch(`${BASE_URL}/apis/${id}/health-check`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteApi(id) {
    const res = await fetch(`${BASE_URL}/apis/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // API Keys
  async getApiKeys() {
    const res = await fetch(`${BASE_URL}/keys`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async issueApiKey(name, apiId, userId = null) {
    const res = await fetch(`${BASE_URL}/keys`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, apiId, userId }),
    });
    return handleResponse(res);
  },

  async toggleKeyStatus(id) {
    const res = await fetch(`${BASE_URL}/keys/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async revokeApiKey(id) {
    const res = await fetch(`${BASE_URL}/keys/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Rate Limits
  async getRateLimits() {
    const res = await fetch(`${BASE_URL}/rate-limits`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateRateLimit(apiId, rateLimit, rateLimitWindow) {
    const res = await fetch(`${BASE_URL}/rate-limits/${apiId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ rateLimit, rateLimitWindow }),
    });
    return handleResponse(res);
  },

  // Logs
  async getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/logs?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id = 'all') {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async deleteNotification(id = 'all') {
    const res = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Gateway / API Tester (Execute live request)
  async executeGatewayRequest({ apiId, method = 'GET', apiKey = '', queryParams = '', body = null }) {
    const startTime = performance.now();
    let url = `${BASE_URL}/gateway/execute/${apiId}`;
    if (queryParams) {
      url += queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
    }

    const headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey.trim();
    }

    const options = {
      method: method.toUpperCase(),
      headers,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const responseTime = Math.round(performance.now() - startTime);

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Collect response headers into an object
      const responseHeaders = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime,
        data,
        headers: responseHeaders,
      };
    } catch (err) {
      const responseTime = Math.round(performance.now() - startTime);
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        responseTime,
        data: { error: err.message || 'Network request failed' },
        headers: {},
      };
    }
  },
};

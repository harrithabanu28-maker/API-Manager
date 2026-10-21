import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  HeartPulse,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

export default function ApiManagement() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingApi, setEditingApi] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    method: 'GET',
    description: '',
    rateLimit: 60,
    rateLimitWindow: 60,
    targetUrl: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApis = async () => {
    try {
      const res = await apiService.getApis();
      setApis(res.apis || []);
    } catch (err) {
      console.error('Failed to fetch APIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  const openAddModal = () => {
    setEditingApi(null);
    setFormData({
      name: '',
      endpoint: '/api/v1/users',
      method: 'GET',
      description: '',
      rateLimit: 60,
      rateLimitWindow: 60,
      targetUrl: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (api) => {
    setEditingApi(api);
    setFormData({
      name: api.name,
      endpoint: api.endpoint,
      method: api.method,
      description: api.description || '',
      rateLimit: api.rateLimit || 60,
      rateLimitWindow: api.rateLimitWindow || 60,
      targetUrl: api.targetUrl || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (!formData.name.trim()) throw new Error('API Name is required');
      if (!formData.endpoint.trim()) throw new Error('Endpoint is required');
      if (Number(formData.rateLimit) < 1) throw new Error('Rate limit must be at least 1');

      if (editingApi) {
        await apiService.updateApi(editingApi._id, formData);
      } else {
        await apiService.createApi(formData);
      }
      setShowModal(false);
      fetchApis();
    } catch (err) {
      setFormError(err.message || 'Failed to save API');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (apiId) => {
    try {
      await apiService.toggleApiStatus(apiId);
      fetchApis();
    } catch (err) {
      alert('Failed to update API status: ' + err.message);
    }
  };

  const handleHealthCheck = async (apiId) => {
    try {
      await apiService.checkHealth(apiId);
      fetchApis();
    } catch (err) {
      alert('Health check failed: ' + err.message);
    }
  };

  const handleDelete = async (apiId, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? All associated API keys will be revoked.`)) {
      try {
        await apiService.deleteApi(apiId);
        fetchApis();
      } catch (err) {
        alert('Failed to delete API: ' + err.message);
      }
    }
  };

  const filteredApis = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.endpoint.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>API Management</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Register new endpoints, configure rate limits, observe health status, and toggle availability.
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} /> Register New API
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search APIs by name or endpoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* APIs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading registered APIs...
          </div>
        ) : apis.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} />
            <div className="empty-state-title">No Registered APIs</div>
            <div className="empty-state-desc">
              Your API Manager database is currently clean. Click below to register your first API.
            </div>
            <button onClick={openAddModal} className="btn btn-primary">
              <Plus size={16} /> Register API
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>API Details</th>
                  <th>Method & Endpoint</th>
                  <th>Health Status</th>
                  <th>Rate Limit</th>
                  <th>Requests</th>
                  <th>Avg Latency</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApis.map((api) => {
                  const healthClass =
                    api.healthStatus === 'healthy'
                      ? 'badge-healthy'
                      : api.healthStatus === 'warning'
                      ? 'badge-warning'
                      : 'badge-critical';

                  return (
                    <tr key={api._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{api.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {api.description || 'No description provided'}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span className={`badge-method method-${api.method.toLowerCase()}`}>{api.method}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#93c5fd' }}>
                            {api.endpoint}
                          </span>
                        </div>
                        {api.targetUrl && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                            <ExternalLink size={12} /> {api.targetUrl}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${healthClass}`}>
                          {api.healthStatus}
                        </span>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {api.healthMessage}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{api.rateLimit}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> req/{api.rateLimitWindow || 60}s</span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#fff' }}>{(api.totalRequests || 0).toLocaleString()}</span>
                      </td>

                      <td>
                        <span style={{ color: 'var(--text-primary)' }}>{api.avgResponseTime || 0} ms</span>
                      </td>

                      <td>
                        <span className={`badge ${api.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {api.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleHealthCheck(api._id)}
                            className="btn btn-secondary btn-sm"
                            title="Run Health Check"
                          >
                            <HeartPulse size={14} color="#34d399" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(api._id)}
                            className="btn btn-secondary btn-sm"
                            title={api.status === 'active' ? 'Disable API' : 'Enable API'}
                          >
                            <Power size={14} color={api.status === 'active' ? '#fbbf24' : '#34d399'} />
                          </button>
                          <button
                            onClick={() => openEditModal(api)}
                            className="btn btn-secondary btn-sm"
                            title="Edit API"
                          >
                            <Edit2 size={14} color="#818cf8" />
                          </button>
                          <button
                            onClick={() => handleDelete(api._id, api.name)}
                            className="btn btn-danger btn-sm"
                            title="Delete API"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit API Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {editingApi ? 'Edit Registered API' : 'Register New API'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.84rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">API Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. User Profile Service"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">HTTP Method</label>
                    <select
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Endpoint Path *</label>
                    <input
                      type="text"
                      placeholder="/api/v1/users"
                      value={formData.endpoint}
                      onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target URL (Optional proxy forwarding)</label>
                  <input
                    type="url"
                    placeholder="https://api.example.com/users (Leave empty to use internal mock service)"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  />
                  <span className="form-helper">
                    Leave blank to use the built-in fast responsive mock simulator.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Rate Limit (Allowed Requests)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="60"
                      value={formData.rateLimit}
                      onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Window Duration (Seconds)</label>
                    <input
                      type="number"
                      min="5"
                      placeholder="60"
                      value={formData.rateLimitWindow}
                      onChange={(e) => setFormData({ ...formData, rateLimitWindow: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Describe API functionality and purpose..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingApi ? 'Save Changes' : 'Register API'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Gauge,
  Edit2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export default function RateLimitsPage() {
  const [rateLimits, setRateLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [currentApi, setCurrentApi] = useState(null);
  const [newLimit, setNewLimit] = useState(60);
  const [newWindow, setNewWindow] = useState(60);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRateLimits = async () => {
    try {
      const res = await apiService.getRateLimits();
      setRateLimits(res.rateLimits || []);
    } catch (err) {
      console.error('Failed to load rate limits:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRateLimits();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRateLimits();
  };

  const openEditModal = (item) => {
    setCurrentApi(item);
    setNewLimit(item.rateLimit);
    setNewWindow(item.rateLimitWindow || 60);
    setFormError('');
    setShowModal(true);
  };

  const handleSaveLimit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (Number(newLimit) < 1) throw new Error('Limit must be at least 1 request');
      await apiService.updateRateLimit(currentApi.apiId, newLimit, newWindow);
      setShowModal(false);
      fetchRateLimits();
    } catch (err) {
      setFormError(err.message || 'Failed to update rate limit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Rate Limits</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Configure and enforce per-API request quotas. Backend triggers HTTP 429 when limits are exceeded.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={refreshing}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Quotas'}
        </button>
      </div>

      {/* Info Notice */}
      <div style={{
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.86rem',
        color: '#c7d2fe',
      }}>
        <ShieldAlert size={20} color="#818cf8" flexShrink={0} />
        <div>
          <strong>Backend Enforcement Active:</strong> Sliding-window rate limit checks are executed on every incoming API request. If an API exceeds its limit, the gateway responds with <code>HTTP 429 Too Many Requests</code> and records a rate-limited log entry.
        </div>
      </div>

      {/* Rate Limits Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading rate limit policies...
          </div>
        ) : rateLimits.length === 0 ? (
          <div className="empty-state">
            <Gauge size={48} />
            <div className="empty-state-title">No APIs Configured</div>
            <div className="empty-state-desc">
              Rate limits can be applied to any registered API. Register an API in API Management first.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>API Details</th>
                  <th>Configured Limit</th>
                  <th>Current Window Usage</th>
                  <th>Usage Gauge</th>
                  <th>Quota Status</th>
                  <th>Rate-Limited Requests</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rateLimits.map((item) => {
                  const isApproaching = item.status === 'approaching';
                  const isExceeded = item.status === 'exceeded';

                  const barColor = isExceeded
                    ? 'var(--danger)'
                    : isApproaching
                    ? 'var(--warning)'
                    : 'var(--primary)';

                  return (
                    <tr key={item.apiId}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{item.apiName}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#93c5fd' }}>
                          {item.endpoint}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                          {item.rateLimit}
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          allowed per {item.rateLimitWindow || 60}s
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>
                          {item.currentUsage} <span style={{ color: 'var(--text-muted)' }}>/ {item.rateLimit}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          in active window
                        </span>
                      </td>

                      <td style={{ minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: barColor }}>
                            {item.usagePercentage}%
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div
                            className="progress-bar"
                            style={{
                              width: `${item.usagePercentage}%`,
                              backgroundColor: barColor,
                            }}
                          />
                        </div>
                      </td>

                      <td>
                        {isExceeded ? (
                          <span className="badge badge-critical">
                            <XCircle size={12} /> Limit Reached (429)
                          </span>
                        ) : isApproaching ? (
                          <span className="badge badge-warning">
                            <AlertTriangle size={12} /> Approaching (≥80%)
                          </span>
                        ) : (
                          <span className="badge badge-healthy">
                            <CheckCircle size={12} /> Normal
                          </span>
                        )}
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: item.totalRateLimitedRequests > 0 ? '#f87171' : 'var(--text-primary)' }}>
                          {item.totalRateLimitedRequests.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}> blocked</span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit2 size={13} /> Edit Limit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Limit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Configure Rate Limit for {currentApi?.apiName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLimit}>
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
                  <label className="form-label">Allowed Request Quota</label>
                  <input
                    type="number"
                    min="1"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    required
                  />
                  <span className="form-helper">
                    Number of allowed requests before returning HTTP 429 Too Many Requests.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Sliding Window Duration (Seconds)</label>
                  <input
                    type="number"
                    min="5"
                    value={newWindow}
                    onChange={(e) => setNewWindow(e.target.value)}
                    required
                  />
                  <span className="form-helper">
                    Window duration over which requests are counted (e.g. 60 seconds).
                  </span>
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
                  {submitting ? 'Updating...' : 'Update Quota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

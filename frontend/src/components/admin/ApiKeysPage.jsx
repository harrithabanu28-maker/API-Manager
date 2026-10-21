import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Key,
  Plus,
  Power,
  Trash2,
  Copy,
  Check,
  Search,
  Shield,
  X,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [newKeyIssued, setNewKeyIssued] = useState(null); // stores { secretKey, ... } shown once
  const [copied, setCopied] = useState(false);

  // Form states
  const [keyName, setKeyName] = useState('');
  const [selectedApiId, setSelectedApiId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [keysData, apisData] = await Promise.all([
        apiService.getApiKeys(),
        apiService.getApis(),
      ]);
      setKeys(keysData.keys || []);
      setApis(apisData.apis || []);
      if (apisData.apis?.length > 0 && !selectedApiId) {
        setSelectedApiId(apisData.apis[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIssueKey = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (!keyName.trim()) throw new Error('Key name is required');
      if (!selectedApiId) throw new Error('Please select an API');

      const res = await apiService.issueApiKey(keyName, selectedApiId);
      setShowIssueModal(false);
      setNewKeyIssued(res.key);
      setKeyName('');
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to issue API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (keyId) => {
    try {
      await apiService.toggleKeyStatus(keyId);
      fetchData();
    } catch (err) {
      alert('Failed to update key status: ' + err.message);
    }
  };

  const handleRevokeKey = async (keyId, name) => {
    if (window.confirm(`Permanently revoke API key "${name}"? This action cannot be undone.`)) {
      try {
        await apiService.revokeApiKey(keyId);
        fetchData();
      } catch (err) {
        alert('Failed to revoke key: ' + err.message);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredKeys = keys.filter(
    (k) =>
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.api?.name?.toLowerCase().includes(search.toLowerCase()) ||
      k.keyPrefix?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>API Keys</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Provision, monitor, and revoke cryptographic API access keys for registered APIs.
          </p>
        </div>
        <button
          onClick={() => {
            setShowIssueModal(true);
            setFormError('');
          }}
          className="btn btn-primary"
          disabled={apis.length === 0}
        >
          <Plus size={16} /> Issue API Key
        </button>
      </div>

      {/* Newly Issued Secret Key Notification Banner */}
      {newKeyIssued && (
        <div style={{
          backgroundColor: '#06201b',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700 }}>
              <Shield size={18} /> New API Key Generated Successfully
            </div>
            <button
              onClick={() => setNewKeyIssued(null)}
              style={{ background: 'none', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Please copy this secret key now. For security purposes, it will never be displayed in plain text again.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="code-box" style={{ flex: 1, color: '#34d399' }}>
              {newKeyIssued.secretKey}
            </div>
            <button
              onClick={() => copyToClipboard(newKeyIssued.secretKey)}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1rem' }}
            >
              {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search keys by name or API..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* Keys Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="empty-state">
            <Key size={48} />
            <div className="empty-state-title">No API Keys Issued</div>
            <div className="empty-state-desc">
              No API keys exist yet. Click below to issue an API key for any registered API.
            </div>
            <button
              onClick={() => setShowIssueModal(true)}
              className="btn btn-primary"
              disabled={apis.length === 0}
            >
              <Plus size={16} /> Issue API Key
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Masked Secret Key</th>
                  <th>Associated API</th>
                  <th>Assigned User</th>
                  <th>Request Usage</th>
                  <th>Last Used</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((k) => (
                  <tr key={k._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{k.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Created {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                          backgroundColor: '#0d121f',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          color: '#38bdf8',
                        }}>
                          {k.maskedKey}
                        </span>
                        <button
                          onClick={() => copyToClipboard(k.maskedKey)}
                          style={{ background: 'none', color: 'var(--text-muted)' }}
                          title="Copy Masked Key"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500, color: '#fff' }}>{k.api?.name || 'Unknown API'}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {k.api?.endpoint}
                      </div>
                    </td>

                    <td>
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{k.user?.name || 'System'}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{k.user?.email}</div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{(k.requestCount || 0).toLocaleString()}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> reqs</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {k.lastUsed ? new Date(k.lastUsed).toLocaleString() : 'Never'}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          k.status === 'active'
                            ? 'badge-success'
                            : k.status === 'inactive'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {k.status !== 'revoked' && (
                          <button
                            onClick={() => handleToggleStatus(k._id)}
                            className="btn btn-secondary btn-sm"
                            title={k.status === 'active' ? 'Deactivate Key' : 'Activate Key'}
                          >
                            <Power size={14} color={k.status === 'active' ? '#fbbf24' : '#34d399'} />
                          </button>
                        )}
                        {k.status !== 'revoked' && (
                          <button
                            onClick={() => handleRevokeKey(k._id, k.name)}
                            className="btn btn-danger btn-sm"
                            title="Revoke Key"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Key Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Issue New API Key
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleIssueKey}>
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
                  <label className="form-label">Key Name / Identifier *</label>
                  <input
                    type="text"
                    placeholder="e.g. Production Mobile App"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                  />
                  <span className="form-helper">
                    Give this key a descriptive label to identify client usage.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Authorized API *</label>
                  <select
                    value={selectedApiId}
                    onChange={(e) => setSelectedApiId(e.target.value)}
                    required
                  >
                    {apis.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.endpoint})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Generating...' : 'Issue Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Key,
  Plus,
  Copy,
  Check,
  Shield,
  Trash2,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function MyApiKeysPage({ onSelectKeyForTester }) {
  const [keys, setKeys] = useState([]);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newKeyIssued, setNewKeyIssued] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  // Form
  const [keyName, setKeyName] = useState('');
  const [selectedApiId, setSelectedApiId] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchKeys = async () => {
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
      console.error('Failed to load keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (!keyName.trim()) throw new Error('Key name is required');
      if (!selectedApiId) throw new Error('Please select an API');

      const res = await apiService.issueApiKey(keyName, selectedApiId);
      setShowGenerateModal(false);
      setNewKeyIssued(res.key);
      setKeyName('');
      fetchKeys();
    } catch (err) {
      setFormError(err.message || 'Failed to generate key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (keyId, name) => {
    if (window.confirm(`Are you sure you want to revoke key "${name}"? You will not be able to use it again.`)) {
      try {
        await apiService.revokeApiKey(keyId);
        fetchKeys();
      } catch (err) {
        alert('Failed to revoke key: ' + err.message);
      }
    }
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>My API Keys</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Manage your personal authorization tokens. Pass these keys in the <code>x-api-key</code> request header.
          </p>
        </div>
        <button
          onClick={() => {
            setShowGenerateModal(true);
            setFormError('');
          }}
          className="btn btn-primary"
          disabled={apis.length === 0}
        >
          <Plus size={16} /> Generate API Key
        </button>
      </div>

      {/* Secret Key Modal/Banner for New Key */}
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
              <Shield size={18} /> API Key Generated Successfully
            </div>
            <button
              onClick={() => setNewKeyIssued(null)}
              style={{ background: 'none', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Copy this secret key now and save it securely. It will never be shown again in plain text.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="code-box" style={{ flex: 1, color: '#34d399' }}>
              {newKeyIssued.secretKey}
            </div>
            <button
              onClick={() => copyToClipboard(newKeyIssued.secretKey, 'new')}
              className="btn btn-secondary"
              style={{ padding: '0.8rem 1rem' }}
            >
              {copiedKey === 'new' ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              {copiedKey === 'new' ? 'Copied!' : 'Copy Key'}
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="empty-state">
            <Key size={48} />
            <div className="empty-state-title">No API Keys Generated</div>
            <div className="empty-state-desc">
              Generate your first API key to start calling available APIs through the gateway and API Tester.
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn btn-primary"
              disabled={apis.length === 0}
            >
              <Plus size={16} /> Generate Key
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Key Name</th>
                  <th>Masked Key</th>
                  <th>Authorized API</th>
                  <th>Request Count</th>
                  <th>Last Used</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{k.name}</div>
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
                          onClick={() => copyToClipboard(k.maskedKey, k._id)}
                          style={{ background: 'none', color: 'var(--text-muted)' }}
                          title="Copy Masked Key"
                        >
                          {copiedKey === k._id ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500, color: '#fff' }}>{k.api?.name || 'Authorized API'}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {k.api?.endpoint}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{(k.requestCount || 0).toLocaleString()}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {k.lastUsed ? new Date(k.lastUsed).toLocaleString() : 'Never used'}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${k.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {k.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      {k.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevokeKey(k._id, k.name)}
                          className="btn btn-danger btn-sm"
                          title="Revoke Key"
                        >
                          <Trash2 size={13} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Generate Developer API Key
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                style={{ background: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateKey}>
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
                  <label className="form-label">Key Name / Client Identifier *</label>
                  <input
                    type="text"
                    placeholder="e.g. My Next.js Frontend App"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Select Authorized API *</label>
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
                  onClick={() => setShowGenerateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

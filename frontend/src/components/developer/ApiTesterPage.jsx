import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Play,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function ApiTesterPage({ preselectedApi }) {
  const [apis, setApis] = useState([]);
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tester state
  const [selectedApiId, setSelectedApiId] = useState(preselectedApi?._id || '');
  const [method, setMethod] = useState(preselectedApi?.method || 'GET');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [queryParams, setQueryParams] = useState('');
  const [requestBody, setRequestBody] = useState('{\n  "query": "sample"\n}');

  // Execution result
  const [executing, setExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apisRes, keysRes] = await Promise.all([
          apiService.getApis(),
          apiService.getApiKeys(),
        ]);
        setApis(apisRes.apis || []);
        setKeys(keysRes.keys || []);

        if (apisRes.apis?.length > 0 && !selectedApiId) {
          const first = apisRes.apis[0];
          setSelectedApiId(first._id);
          setMethod(first.method);
        }
      } catch (err) {
        console.error('Failed to load tester data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update method when API changes
  const handleApiSelect = (apiId) => {
    setSelectedApiId(apiId);
    const chosen = apis.find((a) => a._id === apiId);
    if (chosen) {
      setMethod(chosen.method);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedApiId) return;

    setExecuting(true);
    setResponseResult(null);

    let parsedBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        parsedBody = requestBody ? JSON.parse(requestBody) : {};
      } catch (err) {
        setExecuting(false);
        setResponseResult({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          responseTime: 0,
          data: { error: 'Invalid JSON format in Request Body' },
          headers: {},
        });
        return;
      }
    }

    try {
      const result = await apiService.executeGatewayRequest({
        apiId: selectedApiId,
        method,
        apiKey: apiKeyInput,
        queryParams,
        body: parsedBody,
      });

      setResponseResult(result);
    } catch (err) {
      setResponseResult({
        ok: false,
        status: err.status || 500,
        statusText: err.message || 'Execution Error',
        responseTime: 0,
        data: err.data || { error: err.message },
        headers: {},
      });
    } finally {
      setExecuting(false);
    }
  };

  const currentApi = apis.find((a) => a._id === selectedApiId);

  const copyResponseJson = () => {
    if (!responseResult) return;
    navigator.clipboard.writeText(JSON.stringify(responseResult.data, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>API Tester</h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Interactive request workbench to execute live API calls, test API keys, inspect latency, and examine real payloads.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Initializing interactive API workbench...
        </div>
      ) : apis.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Code2 size={48} />
            <div className="empty-state-title">No APIs Available for Testing</div>
            <div className="empty-state-desc">
              Please ask an administrator to register an active API first.
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          {/* Request Configurator Form */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Play size={18} color="var(--primary)" />
                <h3 className="card-title">Request Configuration</h3>
              </div>
            </div>

            <form onSubmit={handleSendRequest}>
              {/* Step 1: Select API */}
              <div className="form-group">
                <label className="form-label">1. Select Target API *</label>
                <select
                  value={selectedApiId}
                  onChange={(e) => handleApiSelect(e.target.value)}
                  required
                >
                  {apis.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} — ({a.method} {a.endpoint})
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint Preview & Method */}
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">2. HTTP Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gateway Path</label>
                  <input
                    type="text"
                    disabled
                    value={currentApi ? `/api/gateway/execute/${currentApi.slug || currentApi._id}` : ''}
                    style={{ backgroundColor: '#0d121f', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}
                  />
                </div>
              </div>

              {/* Step 4: API Key */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>4. Authorized API Key (x-api-key header) *</label>
                </div>
                <input
                  type="text"
                  placeholder="Paste your secret key (e.g. apm_live_...)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
                <span className="form-helper">
                  Authentication requires an active API key. You can generate or copy one from "My API Keys".
                </span>
              </div>

              {/* Step 3: Query Parameters */}
              <div className="form-group">
                <label className="form-label">3. Query Parameters (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. limit=10&page=1"
                  value={queryParams}
                  onChange={(e) => setQueryParams(e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              {/* Request Body (for POST/PUT/PATCH) */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <div className="form-group">
                  <label className="form-label">JSON Request Body</label>
                  <textarea
                    rows="4"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.84rem',
                      backgroundColor: '#0d121f',
                      color: '#e2e8f0',
                    }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={executing}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}
              >
                {executing ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Executing Request...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Response Console */}
          <div className="card" style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={18} color="var(--primary)" />
                <h3 className="card-title">Live Response Console</h3>
              </div>

              {responseResult && (
                <button
                  onClick={copyResponseJson}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  {copiedResponse ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  {copiedResponse ? 'Copied' : 'Copy JSON'}
                </button>
              )}
            </div>

            {!responseResult && !executing ? (
              <div className="empty-state" style={{ flex: 1, margin: 'auto' }}>
                <Send size={40} />
                <div className="empty-state-title">Awaiting Execution</div>
                <div className="empty-state-desc">
                  Select an API, enter your authorized API key, and click "Send Request" to observe real-time status code, response time, and payload.
                </div>
              </div>
            ) : executing ? (
              <div className="empty-state" style={{ flex: 1, margin: 'auto' }}>
                <RefreshCw size={40} className="spin" color="var(--primary)" />
                <div className="empty-state-title" style={{ marginTop: '1rem' }}>
                  Processing Request...
                </div>
                <div className="empty-state-desc">
                  Gateway is verifying authentication and validating rate limit window...
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Status Bar */}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem',
                        backgroundColor:
                          responseResult.status >= 200 && responseResult.status < 300
                            ? 'rgba(16, 185, 129, 0.2)'
                            : responseResult.status === 429
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color:
                          responseResult.status >= 200 && responseResult.status < 300
                            ? '#34d399'
                            : responseResult.status === 429
                            ? '#fbbf24'
                            : '#f87171',
                      }}
                    >
                      HTTP {responseResult.status || 'ERROR'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {responseResult.statusText || 'Response Received'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#fff' }}>
                    <Clock size={14} color="#38bdf8" />
                    <span>{responseResult.responseTime} ms</span>
                  </div>
                </div>

                {/* Response Body Box */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    RESPONSE DATA
                  </div>
                  <pre
                    style={{
                      flex: 1,
                      minHeight: '220px',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      backgroundColor: '#0a0e17',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      color: responseResult.ok ? '#34d399' : '#f87171',
                    }}
                  >
                    {typeof responseResult.data === 'object'
                      ? JSON.stringify(responseResult.data, null, 2)
                      : String(responseResult.data)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

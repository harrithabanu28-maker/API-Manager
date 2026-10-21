import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  History,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function RequestHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedApi, setSelectedApi] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [search, setSearch] = useState('');

  const fetchHistory = async () => {
    try {
      const params = {};
      if (selectedApi !== 'all') params.apiId = selectedApi;
      if (selectedMethod !== 'all') params.method = selectedMethod;
      if (selectedResult !== 'all') params.result = selectedResult;
      if (search) params.search = search;

      const [logsData, apisData] = await Promise.all([
        apiService.getLogs(params),
        apiService.getApis(),
      ]);

      setLogs(logsData.logs || []);
      setApis(apisData.apis || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedApi, selectedMethod, selectedResult]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Request History</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Audit trail of all requests dispatched by your personal API keys.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={refreshing}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search API or path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
          />
        </form>

        {/* API Filter */}
        <select
          value={selectedApi}
          onChange={(e) => setSelectedApi(e.target.value)}
          style={{ width: 'auto', minWidth: '160px', fontSize: '0.85rem' }}
        >
          <option value="all">All APIs</option>
          {apis.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Method Filter */}
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          style={{ width: 'auto', fontSize: '0.85rem' }}
        >
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>

        {/* Result Filter */}
        <select
          value={selectedResult}
          onChange={(e) => setSelectedResult(e.target.value)}
          style={{ width: 'auto', fontSize: '0.85rem' }}
        >
          <option value="all">All Results</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="rate_limited">Rate-Limited</option>
        </select>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading request history...
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <History size={48} />
            <div className="empty-state-title">No Requests Recorded</div>
            <div className="empty-state-desc">
              Your account has not executed any requests yet. Use the API Tester or invoke endpoints with your API key to create request logs.
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>API Name</th>
                  <th>Method & Endpoint</th>
                  <th>HTTP Status</th>
                  <th>Response Time</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isSuccess = log.result === 'successful';
                  const isRateLimit = log.result === 'rate_limited';

                  const badgeClass = isSuccess
                    ? 'badge-success'
                    : isRateLimit
                    ? 'badge-warning'
                    : 'badge-danger';

                  const statusColor =
                    log.statusCode >= 200 && log.statusCode < 300
                      ? '#34d399'
                      : log.statusCode === 429
                      ? '#fbbf24'
                      : '#f87171';

                  return (
                    <tr key={log._id}>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 500 }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{log.apiName}</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span className={`badge-method method-${log.method.toLowerCase()}`}>
                            {log.method}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#93c5fd' }}>
                            {log.endpoint}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: statusColor,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }}>
                          {log.statusCode}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                          <Clock size={13} color="var(--text-muted)" />
                          <span>{log.responseTime} ms</span>
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${badgeClass}`}>
                          {isSuccess ? (
                            <CheckCircle size={12} />
                          ) : isRateLimit ? (
                            <AlertTriangle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {log.result === 'rate_limited' ? 'Rate Limited' : log.result}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

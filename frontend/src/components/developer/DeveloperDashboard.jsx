import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Activity,
  CheckCircle,
  Key,
  Layers,
  Play,
  RefreshCw,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DeveloperDashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [availableApis, setAvailableApis] = useState([]);
  const [myKeys, setMyKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDevData = async () => {
    try {
      const [analyticsData, apisData, keysData] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getApis(),
        apiService.getApiKeys(),
      ]);
      setAnalytics(analyticsData);
      setAvailableApis(apisData.apis || []);
      setMyKeys(keysData.keys || []);
    } catch (err) {
      console.error('Failed to load developer dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDevData();
  };

  const summary = analytics?.summary || {
    totalRequests: 0,
    successfulRequests: 0,
    activeKeys: 0,
    activeApis: 0,
  };

  const requestsLast7Days = analytics?.graphs?.requestsLast7Days || [];
  const hasRequests = summary.totalRequests > 0;

  return (
    <div>
      {/* Top Banner & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Developer Dashboard</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Your personal API consumption, active keys, and quick testing console.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onNavigate('api-tester')}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem' }}
          >
            <Play size={14} /> Open API Tester
          </button>
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
      </div>

      {/* 4 Required Developer Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">My Requests</span>
            <span className="stat-value">{summary.totalRequests.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Key size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active API Keys</span>
            <span className="stat-value" style={{ color: '#34d399' }}>
              {myKeys.filter((k) => k.status === 'active').length}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Layers size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Available APIs</span>
            <span className="stat-value">{availableApis.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Successful Requests</span>
            <span className="stat-value" style={{ color: '#34d399' }}>
              {summary.successfulRequests.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Developer 7-Day Usage Graph */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">My API Requests — Last 7 Days</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Actual requests executed using your personal developer API keys
            </p>
          </div>
          <TrendingUp size={18} color="var(--primary)" />
        </div>

        <div style={{ width: '100%', height: 260, position: 'relative' }}>
          {hasRequests ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={requestsLast7Days} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26334d" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151d30',
                    borderColor: '#26334d',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  name="My Requests"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '100%', padding: '1.5rem' }}>
              <TrendingUp size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No personal requests recorded yet</span>
              <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                Generate an API key and test an endpoint in the API Tester to record your first request.
              </span>
              <button onClick={() => onNavigate('api-tester')} className="btn btn-primary btn-sm">
                Launch API Tester
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lower Row: Available APIs Quick Access & My Keys Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Available APIs */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Available APIs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                APIs currently active and ready for consumption
              </p>
            </div>
            <button
              onClick={() => onNavigate('available-apis')}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600 }}
            >
              Explore All →
            </button>
          </div>

          {availableApis.length === 0 ? (
            <div className="empty-state">
              <Layers size={36} />
              <div className="empty-state-title">No APIs Available</div>
              <div className="empty-state-desc">
                No active APIs have been published by administrators yet.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {availableApis.slice(0, 4).map((api) => (
                <div
                  key={api._id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{api.name}</span>
                      <span className={`badge-method method-${api.method.toLowerCase()}`}>{api.method}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#93c5fd', marginTop: '0.2rem' }}>
                      {api.endpoint}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('api-tester')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Play size={12} color="#34d399" /> Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Keys */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">My Active Keys</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Authorized keys provisioned for your account
              </p>
            </div>
            <button
              onClick={() => onNavigate('my-keys')}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600 }}
            >
              Manage Keys →
            </button>
          </div>

          {myKeys.length === 0 ? (
            <div className="empty-state">
              <Key size={36} />
              <div className="empty-state-title">No API Keys Generated</div>
              <div className="empty-state-desc">
                You need an API key to authenticate requests against available endpoints.
              </div>
              <button onClick={() => onNavigate('my-keys')} className="btn btn-primary btn-sm">
                Generate Key
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myKeys.slice(0, 4).map((k) => (
                <div
                  key={k._id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{k.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      marginTop: '0.15rem',
                    }}>
                      {k.maskedKey}
                    </div>
                  </div>
                  <span className={`badge ${k.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                    {k.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

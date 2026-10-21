import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function DeveloperAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load developer analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const summary = analytics?.summary || {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    rateLimitedRequests: 0,
    avgResponseTime: 0,
  };

  const requestsLast7Days = analytics?.graphs?.requestsLast7Days || [];
  const requestStatusDistribution = analytics?.graphs?.requestStatusDistribution || [];
  const hasRequests = summary.totalRequests > 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Usage Analytics</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Personal consumption analytics, success ratios, and request breakdown for your account.
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

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{summary.totalRequests.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Successful Requests</span>
            <span className="stat-value" style={{ color: '#34d399' }}>{summary.successfulRequests.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Failed Requests</span>
            <span className="stat-value" style={{ color: '#f87171' }}>{summary.failedRequests.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Rate-Limited Requests</span>
            <span className="stat-value" style={{ color: '#fbbf24' }}>{summary.rateLimitedRequests.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Response Time</span>
            <span className="stat-value">{summary.avgResponseTime} ms</span>
          </div>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="charts-grid">
        {/* Personal 7-Day Usage Graph */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Personal Request Traffic — Last 7 Days</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Daily requests made with your API keys
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
                    name="Requests"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: '1rem' }}>
                <TrendingUp size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No request data available yet</span>
                <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                  Execute calls using your personal API keys to populate this line graph.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Personal Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Request Status Breakdown</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ratio of successful vs failed vs rate-limited calls
              </p>
            </div>
            <BarChart2 size={18} color="var(--primary)" />
          </div>

          <div style={{ width: '100%', height: 260, position: 'relative' }}>
            {hasRequests ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestStatusDistribution} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26334d" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151d30',
                      borderColor: '#26334d',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="value" name="Request Count" radius={[6, 6, 0, 0]}>
                    {requestStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: '1rem' }}>
                <BarChart2 size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No request data available yet</span>
                <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                  Executions will be categorized into success, error, and quota blocks.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

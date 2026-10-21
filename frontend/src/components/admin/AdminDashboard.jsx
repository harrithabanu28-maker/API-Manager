import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Key,
  TrendingUp,
  RefreshCw,
  Bell,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [apis, setApis] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [analyticsData, apisData, notifsData] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getApis(),
        apiService.getNotifications(),
      ]);
      setAnalytics(analyticsData);
      setApis(apisData.apis || []);
      setNotifications(notifsData.notifications?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
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

  const STATUS_COLORS = {
    Successful: '#10b981',
    Failed: '#ef4444',
    'Rate-Limited': '#f59e0b',
  };

  return (
    <div>
      {/* Top Banner & Refresh */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Admin Dashboard</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Real-time API gateway metrics, health monitoring, and activity overview.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={refreshing}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* 5 Mandatory Summary Cards */}
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

      {/* Required Graphs Section */}
      <div className="charts-grid">
        {/* Graph 1: API Requests — Last 7 Days */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Graph 1: API Requests — Last 7 Days</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Actual daily API request volume over the past 7 days
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
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: '1rem' }}>
                <TrendingUp size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No request data available yet</span>
                <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                  Requests made via API keys will immediately populate this line graph.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Graph 2: Request Status */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Graph 2: Request Status</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Distribution of Successful, Failed, and Rate-Limited requests
              </p>
            </div>
            <Activity size={18} color="var(--primary)" />
          </div>

          <div style={{ width: '100%', height: 260, position: 'relative' }}>
            {hasRequests ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestStatusDistribution.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {requestStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151d30',
                      borderColor: '#26334d',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: '1rem' }}>
                <Activity size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No request data available yet</span>
                <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                  Chart will break down successful, failed, and rate-limited executions.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: API Health and Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Registered API Health */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">API Health Status</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Live health assessment based on latency, failure rate, and availability
              </p>
            </div>
            <button
              onClick={() => onNavigate('api-management')}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600 }}
            >
              Manage APIs →
            </button>
          </div>

          {apis.length === 0 ? (
            <div className="empty-state">
              <Layers size={36} />
              <div className="empty-state-title">No APIs registered yet</div>
              <div className="empty-state-desc">
                Register your first API to start gateway routing and health tracking.
              </div>
              <button onClick={() => onNavigate('api-management')} className="btn btn-primary btn-sm">
                Add New API
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {apis.slice(0, 5).map((api) => {
                const healthClass =
                  api.healthStatus === 'healthy'
                    ? 'healthy'
                    : api.healthStatus === 'warning'
                    ? 'warning'
                    : 'critical';

                const badgeClass =
                  api.healthStatus === 'healthy'
                    ? 'badge-healthy'
                    : api.healthStatus === 'warning'
                    ? 'badge-warning'
                    : 'badge-critical';

                return (
                  <div
                    key={api._id}
                    style={{
                      padding: '0.9rem 1.1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`status-dot ${healthClass}`} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{api.name}</span>
                          <span className={`badge-method method-${api.method.toLowerCase()}`}>{api.method}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {api.healthMessage || 'Operational'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`badge ${badgeClass}`}>
                        {api.healthStatus}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {api.avgResponseTime || 0} ms avg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications & Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent System Notifications</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                System alerts generated from real gateway events
              </p>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              style={{ background: 'none', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600 }}
            >
              View All →
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={36} />
              <div className="empty-state-title">No notifications</div>
              <div className="empty-state-desc">
                Alerts will appear here when rate limits are approached, keys are issued, or errors occur.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((notif) => {
                const badgeColor =
                  notif.type === 'critical'
                    ? 'badge-critical'
                    : notif.type === 'warning'
                    ? 'badge-warning'
                    : 'badge-info';

                return (
                  <div
                    key={notif._id}
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#fff' }}>{notif.title}</span>
                      <span className={`badge ${badgeColor}`} style={{ fontSize: '0.68rem' }}>{notif.type}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleTimeString()} · {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

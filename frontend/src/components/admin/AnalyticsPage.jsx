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
  PieChart as PieIcon,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
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
  const responseTimeTrend = analytics?.graphs?.responseTimeTrend || [];

  const hasRequests = summary.totalRequests > 0;

  const STATUS_COLORS = {
    Successful: '#10b981',
    Failed: '#ef4444',
    'Rate-Limited': '#f59e0b',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Analytics</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            Comprehensive performance analytics, request volume distribution, and response time metrics.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary"
          disabled={refreshing}
          style={{ fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Analytics'}
        </button>
      </div>

      {/* 5 Required Summary Cards */}
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

      {/* Mandatory Graphs Grid */}
      <div className="charts-grid">
        {/* Graph 1: API Requests — Last 7 Days */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Graph 1: API Requests — Last 7 Days</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                X-axis: Day | Y-axis: Number of Requests
              </p>
            </div>
            <TrendingUp size={18} color="var(--primary)" />
          </div>

          <div style={{ width: '100%', height: 280, position: 'relative' }}>
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
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="requests"
                    name="Total Requests"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="successful"
                    name="Successful"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', padding: '1rem' }}>
                <TrendingUp size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No request data available yet</span>
                <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                  Send requests via client keys or the API Tester to visualize daily request frequency.
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
                Comparison of Successful, Failed, and Rate-Limited requests
              </p>
            </div>
            <BarChart2 size={18} color="var(--primary)" />
          </div>

          <div style={{ width: '100%', height: 280, position: 'relative' }}>
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
                  Recorded requests will automatically generate status distribution comparisons.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graph 3: Average Response Time Over Time */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Graph 3: Average Response Time</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Actual response latency (ms) plotted across chronological gateway executions
            </p>
          </div>
          <Clock size={18} color="var(--primary)" />
        </div>

        <div style={{ width: '100%', height: 280, position: 'relative' }}>
          {responseTimeTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26334d" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151d30',
                    borderColor: '#26334d',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(val) => [`${val} ms`, 'Response Time']}
                />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  name="Response Time"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '100%', padding: '2rem' }}>
              <Clock size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <span className="empty-state-title" style={{ fontSize: '0.95rem' }}>No request data available yet</span>
              <span className="empty-state-desc" style={{ fontSize: '0.8rem' }}>
                Execute requests through the API Tester to track real response time latency over time.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

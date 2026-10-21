import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  CheckCheck,
  Trash2,
  RefreshCw,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiService.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.markNotificationRead('all');
      fetchNotifications();
    } catch (err) {
      alert('Failed to mark notifications as read');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all notifications?')) {
      try {
        await apiService.deleteNotification('all');
        fetchNotifications();
      } catch (err) {
        alert('Failed to clear notifications');
      }
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await apiService.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>Notifications</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            System events, threshold alerts, rate-limit warnings, and security updates.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleRefresh}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {notifications.length > 0 && (
            <>
              <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
                <CheckCheck size={14} color="#34d399" /> Mark All Read
              </button>
              <button onClick={handleClearAll} className="btn btn-danger btn-sm">
                <Trash2 size={14} /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: notifications.length === 0 ? '1.5rem' : '0.5rem', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <div className="empty-state-title">No System Notifications</div>
            <div className="empty-state-desc">
              All systems are operating normally. Real notifications will trigger here when an API approaches limits, experiences latency spikes, or keys are issued.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, idx) => {
              const isUnread = !n.read;
              const isCritical = n.type === 'critical';
              const isWarning = n.type === 'warning';
              const isInfo = n.type === 'info';

              const icon = isCritical ? (
                <XCircle size={18} color="#ef4444" />
              ) : isWarning ? (
                <AlertTriangle size={18} color="#f59e0b" />
              ) : (
                <Info size={18} color="#6366f1" />
              );

              return (
                <div
                  key={n._id}
                  style={{
                    padding: '1.1rem 1.25rem',
                    borderBottom: idx < notifications.length - 1 ? '1px solid var(--border-color)' : 'none',
                    backgroundColor: isUnread ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>
                          {n.title}
                        </span>
                        {isUnread && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(99, 102, 241, 0.25)',
                            color: '#818cf8',
                            textTransform: 'uppercase',
                          }}>
                            New
                          </span>
                        )}
                        {n.apiName && (
                          <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                          }}>
                            {n.apiName}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {n.message}
                      </p>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        {new Date(n.createdAt).toLocaleTimeString()} · {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isUnread && (
                      <button
                        onClick={() => handleMarkSingleRead(n._id)}
                        className="btn btn-secondary btn-sm"
                        title="Mark as read"
                      >
                        <CheckCircle size={13} color="#34d399" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSingle(n._id)}
                      className="btn btn-secondary btn-sm"
                      title="Delete notification"
                    >
                      <Trash2 size={13} color="#f87171" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

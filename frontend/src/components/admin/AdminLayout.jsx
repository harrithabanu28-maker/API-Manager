import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Key,
  Gauge,
  FileText,
  Bell,
  BarChart3,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import AdminDashboard from './AdminDashboard';
import ApiManagement from './ApiManagement';
import ApiKeysPage from './ApiKeysPage';
import RateLimitsPage from './RateLimitsPage';
import RequestLogsPage from './RequestLogsPage';
import NotificationsPage from './NotificationsPage';
import AnalyticsPage from './AnalyticsPage';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'api-management', label: 'API Management', icon: <Layers size={18} /> },
    { id: 'api-keys', label: 'API Keys', icon: <Key size={18} /> },
    { id: 'rate-limits', label: 'Rate Limits', icon: <Gauge size={18} /> },
    { id: 'request-logs', label: 'Request Logs', icon: <FileText size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveTab} />;
      case 'api-management':
        return <ApiManagement />;
      case 'api-keys':
        return <ApiKeysPage />;
      case 'rate-limits':
        return <RateLimitsPage />;
      case 'request-logs':
        return <RequestLogsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <AdminDashboard onNavigate={setActiveTab} />;
    }
  };

  const getPageTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Admin Portal';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Layers size={20} />
          </div>
          <div>
            <div className="sidebar-title">API Manager</div>
            <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 600 }}>
              Admin Portal
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <span className="user-name">{user?.name || 'Administrator'}</span>
            <span className="user-role">Administrator</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'none',
              color: 'var(--text-muted)',
              padding: '0.35rem',
              borderRadius: '4px',
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="top-bar">
          <div className="page-title">{getPageTitle()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.78rem',
              color: '#818cf8',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontWeight: 600,
            }}>
              <ShieldCheck size={14} /> Admin Workspace
            </span>
          </div>
        </header>

        <main className="page-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
